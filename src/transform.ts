/*
 * @copyright Microsoft Corporation. All rights reserved.
 */
import { Project, SyntaxKind } from 'ts-morph';

function transform(targetId: string) {
  const project = new Project({
    tsConfigFilePath: './tsconfig.json'
  });

  const sourceFiles = project.getSourceFiles('src/test/**/*.ts');

  for (const srcFile of sourceFiles) {
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
    }
  }
}

transform('cc6daf8f-3d72-4c85-adea-cbb098663992');
