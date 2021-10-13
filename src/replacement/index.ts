/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import { IfStatement, Project, SyntaxKind, FunctionDeclaration, ReferenceEntry, Node, ts } from 'ts-morph';

import { isAncestorOf } from '../utils';

const KS_IMPORT_SPECIFIER = '_SPKillSwitch';
const KS_ACTIVATED_METHOD = `${KS_IMPORT_SPECIFIER}.isActivated`;

const marks = new Set<IfStatement>();

/**
 * Scan the project to find KS's declaration
 * @param project Target project
 * @param targetId KS ID
 */
export function findKSDeclaration(project: Project, targetId: string): FunctionDeclaration[] {
  // May have multiple decls with the same id, so it's an array
  const result: FunctionDeclaration[] = [];

  // Declarations can only appear where we have KS imports
  const ksFiles = project.getSourceFiles().filter((f) =>
    f
      .getDescendantsOfKind(SyntaxKind.ImportSpecifier)
      .map((im) => im.getName())
      .includes(KS_IMPORT_SPECIFIER)
  );

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
function findAffectedIf(ksNode: Node<ts.Node>) {
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

function replaceFunCallWithFalse(ksDecl: FunctionDeclaration) {
  const refSymbols = ksDecl.findReferences();
  refSymbols.forEach((refSymbol) => {
    refSymbol.getReferences().forEach((ref) => {
      const refNode = ref.getNode();
      const parentCall = refNode.getParentIfKind(SyntaxKind.CallExpression);
      // not a function call(e.g. declaration, import), skip
      if (parentCall) {
        return;
      }
      parentCall.replaceWithText('false');
    });
  });
}

function transform(project: Project, targetId: string) {
  const ksDecls = findKSDeclaration(project, targetId);
  ksDecls.forEach(replaceFunCallWithFalse);
}
