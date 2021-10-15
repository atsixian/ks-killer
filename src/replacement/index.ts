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
export function findKSDeclaration(
  project: Project,
  targetId: string,
  ksFilePath?: string
): FunctionDeclaration[] {
  // May have multiple decls with the same id, so it's an array
  const result: FunctionDeclaration[] = [];

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
      // restrict the structre
      // return _SPKillSwitch.isActivated(ID)
      const returnStatement = funDecl.getFirstDescendantByKind(SyntaxKind.ReturnStatement);
      const callExp = returnStatement?.getExpressionIfKind(SyntaxKind.CallExpression);
      const accessExp = callExp?.getExpressionIfKind(SyntaxKind.PropertyAccessExpression);
      // wrong structure or ID doesn't match, skip
      if (
        accessExp?.getText() != KS_ACTIVATED_METHOD ||
        callExp?.getArguments()[0]?.getText() !== `'${targetId}'`
      ) {
        return;
      }
      result.push(funDecl);
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
export function replaceFunCallWithFalse(ksDecl: FunctionDeclaration): Set<Node<ts.Node>> {
  const workList = new Set<Node<ts.Node>>();
  const refSymbols = ksDecl.findReferences();
  console.log(`${refSymbols.length} references found`);
  refSymbols.forEach((refSymbol) => {
    refSymbol.getReferences().forEach((ref) => {
      const refNode = ref.getNode();
      const parent = refNode.getParent();
      if (parent.getKind() === SyntaxKind.ImportSpecifier) {
        parent.replaceWithText('');
        return;
      }
      // not a function call(e.g. declaration), skip
      if (!(parent.getKind() === SyntaxKind.CallExpression)) {
        return;
      }
      console.log(`Handling ${ref.getSourceFile().getFilePath()}`);
      // if it's negated, replace the whole thing with true
      const negation = parent.getParentIfKind(SyntaxKind.PrefixUnaryExpression);
      if (negation.getOperatorToken() === SyntaxKind.ExclamationToken) {
        workList.add(negation.replaceWithText('true').getParent());
      } else {
        workList.add(parent.replaceWithText('false').getParent());
      }
    });
  });
  return workList;
}
