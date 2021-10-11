/*
 * @copyright Microsoft Corporation. All rights reserved.
 */
import { Project, SyntaxKind } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: './tsconfig.json'
});

const sourceFiles = project.getSourceFiles('src/test/**/*.ts');

for (const srcFile of sourceFiles) {
  const functions = srcFile.getChildrenOfKind(SyntaxKind.FunctionDeclaration);
  for (const func of functions) {
    const returnStatements = func.getChildrenOfKind(SyntaxKind.ReturnStatement)[0];
    if (!returnStatements) {
      continue;
    }
    const callExp = returnStatements.getExpressionIfKind(SyntaxKind.CallExpression);
    if (!callExp) {
      continue;
    }
    const accessExp = callExp.getExpressionIfKind(SyntaxKind.PropertyAccessExpression);
    if (accessExp?.getText() !== '_SPKillSwitch.isActivated') {
      continue;
    }
  }
}
