/*
 * @copyright Microsoft Corporation. All rights reserved.
 */
import { Project, SyntaxKind } from 'ts-morph';

function transform(targetId: string) {
  const project = new Project({
    tsConfigFilePath: './tsconfig.json'
  });

  const srcFiles = project.getSourceFiles('src/test/**/*.ts');

  for (const srcFile of srcFiles) {
    const functions = srcFile.getChildrenOfKind(SyntaxKind.FunctionDeclaration);
    for (const func of functions) {
      const returnStatement = func.getDescendantsOfKind(SyntaxKind.ReturnStatement)[0];
      const callExp = returnStatement?.getExpressionIfKind(SyntaxKind.CallExpression);
      const accessExp = callExp?.getExpressionIfKind(SyntaxKind.PropertyAccessExpression);
      const stringLiteral = callExp?.getDescendantsOfKind(SyntaxKind.StringLiteral)[0];
      if (accessExp?.getText() !== '_SPKillSwitch.isActivated' || stringLiteral?.getText() !== `'${targetId}'`) {
        continue;
      }
      console.log('found');
      const references = func.findReferences();
      for (const ref of references) {
        const refDef = ref.getDefinition();
        const name = refDef.getSourceFile().getBaseName();
        // Skip references in current file
        if (name == srcFile.getBaseName()) {
          continue;
        }
        const refNode = refDef.getNode();
        // TODO: Find the expression in the if block
        const idReferences = refNode;
        for (const idRef of idReferences) {
          const idKind = idRef.getDefinition().getNode().getKind();
          console.log({ idKind });
          if (idKind === SyntaxKind.IfStatement) {
            console.log(
              'found ref in if'
            );
          }
        }
      }
    }
  }
}

transform('cc6daf8f-3d72-4c85-adea-cbb098663992');
