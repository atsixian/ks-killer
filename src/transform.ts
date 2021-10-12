/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import { Node, Project, SyntaxKind, ts } from 'ts-morph';

import { isAncestorOf } from './utils';

const marks = new Set<Node<ts.Node>>();

function transform(targetId: string) {
  const project = new Project({
    tsConfigFilePath: './tsconfig.json'
  });

  const srcFiles = project.getSourceFiles('src/test/{app,ks}.ts');

  for (const srcFile of srcFiles) {
    // TODO only care about files with _SPKillSwitch import
    const functions = srcFile.getChildrenOfKind(SyntaxKind.FunctionDeclaration);
    for (const func of functions) {
      const returnStatement = func.getFirstDescendantByKind(SyntaxKind.ReturnStatement);
      const callExp = returnStatement?.getExpressionIfKind(SyntaxKind.CallExpression);
      const accessExp = callExp?.getExpressionIfKind(SyntaxKind.PropertyAccessExpression);
      const stringLiteral = callExp?.getFirstDescendantByKind(SyntaxKind.StringLiteral);
      if (
        accessExp?.getText() !== '_SPKillSwitch.isActivated' ||
        stringLiteral?.getText() !== `'${targetId}'`
      ) {
        continue;
      }
      console.log('[transform] found ref');
      // Replace all references with 'true'
      const refSymbols = func.findReferences();

      for (const refSymbol of refSymbols) {
        const refDef = refSymbol.getDefinition();
        const name = refDef.getSourceFile().getBaseName();
        // Skip references in current file
        // TODO Or just skip declaration?
        if (name == srcFile.getBaseName()) {
          continue;
        }

        const refs = refSymbol.getReferences();
        // Mark related Ifs
        refs.forEach((ref) => {
          console.log(
            `BEFORE ==============================================================================\n${ref
              .getSourceFile()
              .print()}`
          );

          const refNode = ref.getNode();
          // not a function call(e.g. declaration, import), skip
          if (!refNode.getParentIfKind(SyntaxKind.CallExpression)) {
            return;
          }

          const ifAncestor = refNode.getFirstAncestorByKind(SyntaxKind.IfStatement);
          const blockAncestor = refNode.getFirstAncestorByKind(SyntaxKind.Block);
          // if it affects any condition for an if statement
          if (ifAncestor) {
            // check if it's directly related
            if (blockAncestor && isAncestorOf(ifAncestor, blockAncestor)) {
              return;
            }
            // mark it and handle in the next pass
            marks.add(ifAncestor);
          }
          const callExpr = refNode.getParentIfKind(SyntaxKind.CallExpression);
          callExpr?.replaceWithText('true');
          console.log(
            `AFTER ==============================================================================\n${ref
              .getSourceFile()
              .print()}`
          );
        });
      }
    }
  }
}

transform('cc6daf8f-3d72-4c85-adea-cbb098663992');
