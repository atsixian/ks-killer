/*
 * @copyright Microsoft Corporation. All rights reserved.
 */
import { IfStatement, Project, SyntaxKind } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: './tsconfig.json'
});

const sourceFiles = project.getSourceFiles('src/test/**/*.ts');

sourceFiles.forEach((srcFile) => {
  // get all if statements in the file
  const ifStmts = srcFile.getChildrenOfKind(SyntaxKind.IfStatement);
  ifStmts.forEach((ifStmt) => {
    console.log(ifStmt.getExpression().print());
  });
});
