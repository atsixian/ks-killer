/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import { FunctionDeclaration, IfStatement, Node, Project, SourceFile, SyntaxKind, ts } from 'ts-morph';
import { isAncestorOf } from '../utils';

const KS_IMPORT_SPECIFIER = '_SPKillSwitch';
const KS_ACTIVATED_METHOD = `${KS_IMPORT_SPECIFIER}.isActivated`;

/**
 * Scan the project to find KS's declaration
 * @param project Target project
 * @param targetId KS ID
 * @param ksFilePath The file containing KS declaration. This boosts performance.
 */
export interface ICoreParameter {
  targetId?: string,
  ksFilePath?: string,
  thresholdDate?: Date
}
// graduate ks before 180 days
const defaultDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 180);

export function findKSDeclaration(project: Project, object: ICoreParameter): FunctionDeclaration[] {
  // May have multiple decls with the same id, so it's an array
  const result: FunctionDeclaration[] = [];

  const { targetId, ksFilePath, thresholdDate = defaultDate } = object;

  // find file with 'KS_ACTIVATED_METHOD'
  let ksFiles: SourceFile[];
  if (ksFilePath) {
    try {
      ksFiles.push(project.getSourceFileOrThrow(ksFilePath));
    } catch (err) {
      console.error(`Invalid KS file path: ${ksFilePath}`);
    }
  } else {
    // Declarations can only appear where we have KS imports
    ksFiles = project.getSourceFiles().filter((f) =>
      f
        .getDescendantsOfKind(SyntaxKind.ImportSpecifier)
        .map((im) => im.getName())
        .includes(KS_IMPORT_SPECIFIER)
    );
  }

  ksFiles.forEach((ksFile) => {
    const funDecls = ksFile.getChildrenOfKind(SyntaxKind.FunctionDeclaration);
    funDecls.forEach((funDecl) => {
      // restrict the structure
      // return _SPKillSwitch.isActivated(ID)
      const returnStatement = funDecl.getFirstDescendantByKind(SyntaxKind.ReturnStatement);
      const callExp = returnStatement?.getExpressionIfKind(SyntaxKind.CallExpression);
      const accessExp = callExp?.getExpressionIfKind(SyntaxKind.PropertyAccessExpression);
      // wrong structure, skip
      if (
        accessExp?.getText() != KS_ACTIVATED_METHOD
      ) {
        return;
      }

      // if targetId is provided, it should be matched with the ks id
      if (targetId) {
        if (callExp?.getArguments()[0]?.getText() === `'${targetId}'`) {
          result.push(funDecl as FunctionDeclaration);
        }
      } else {
        // if the second argument exist,it should be the date
        let dateString = callExp?.getArguments()[1]?.getText();

        // invalid date string
        if (isNaN(Date.parse(dateString))) {
          dateString = "";
        }

        if (!dateString) {
          // get comments in line 
          const comments = callExp?.getArguments()[0]?.getTrailingCommentRanges();
          for (const comment of comments!) {
            const commentText = comment.getText();
            const execResult = /['"](\d{1,2}\/\d{1,2}\/\d{1,4})["']/g.exec(commentText);
            dateString = execResult && execResult[1];
          }
        }

        if (!dateString) {
          // get comments in block
          const comments1 = returnStatement.getChildren()[1]?.getText();
          const execResult2 = /\/\*.*['"](\d{1,2}\/\d{1,2}\/\d{1,4})["']/g.exec(comments1);
          dateString = execResult2 && execResult2[1];
        }

        if (dateString) {
          const parsedDate: Date = new Date(dateString);
          if (parsedDate < thresholdDate) {
            result.push(funDecl as FunctionDeclaration);
          }
        }
      }
    });
  });

  return result;
}

/**
 * Find if the KS affect any if block
 * @param node The KS call
 */
function findAffectedIf(ksNode: Node<ts.Node>): IfStatement | undefined {
  const ifAncestor = ksNode.getFirstAncestorByKind(SyntaxKind.IfStatement);
  const blockAncestor = ksNode.getFirstAncestorByKind(SyntaxKind.Block);
  if (ifAncestor) {
    // if it's not used as an condition expression for if, skip
    if (blockAncestor && isAncestorOf(ifAncestor, blockAncestor)) {
      return;
    }
    return ifAncestor;
  }
}

/**
 * Replace KS calls with 'false'
 * @param ksDecl KS Declarations. Used to find references.
 * @returns A list of nodes to be optimized.
 */
export function replaceFunCallWithFalse(ksDecl: FunctionDeclaration): {
  workList: Set<Node<ts.Node>>;
  refFiles: Array<SourceFile>;
} {
  const workList = new Set<Node<ts.Node>>();
  const refFiles = new Set<SourceFile>();
  console.log('Finding references...');
  const refSymbols = ksDecl.findReferences();
  refSymbols.forEach((refSymbol) => {
    refSymbol.getReferences().forEach((ref) => {
      const refNode = ref.getNode();
      const parent = refNode.getParent();
      // not a function call(e.g. declaration), skip
      if (!(parent.getKind() === SyntaxKind.CallExpression)) {
        return;
      }
      refFiles.add(refNode.getSourceFile());
      // if it's negated, replace the whole thing with true
      const negation = parent.getParentIfKind(SyntaxKind.PrefixUnaryExpression);
      if (negation?.getOperatorToken() === SyntaxKind.ExclamationToken) {
        workList.add(negation.replaceWithText('true').getParent());
      } else {
        workList.add(parent.replaceWithText('false').getParent());
      }
    });
  });
  return { workList, refFiles: [...refFiles] };
}
