/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import { IfStatement, Project, Statement, SyntaxKind } from 'ts-morph';
import { unwrapBlock } from './utils';

const project = new Project({
  tsConfigFilePath: './tsconfig.json'
});

const sourceFiles = project.getSourceFiles('src/test/if-not-false.ts');

sourceFiles.forEach((srcFile) => {
  console.log(
    `BEFORE ==============================================================================\n${srcFile.print()}`
  );
  const ifStmts = srcFile.getChildrenOfKind(SyntaxKind.IfStatement);
  ifStmts.forEach((ifStmt) => {
    if (isAlwaysTrue(ifStmt)) {
      const thenBlock = ifStmt.getThenStatement();
      ifStmt.replaceWithText(unwrapBlock(thenBlock));
    }
  });
  console.log(
    `AFTER ===============================================================================\n${srcFile.print()}`
  );
});

function isAlwaysTrue(ifStmt: IfStatement): boolean {
  const exp = ifStmt.getExpressionIfKind(SyntaxKind.PrefixUnaryExpression);
  return Boolean(
    ifStmt.getExpressionIfKind(SyntaxKind.TrueKeyword) ||
      (exp &&
        exp.getOperatorToken() === SyntaxKind.ExclamationToken &&
        exp.getOperand().getKind() === SyntaxKind.FalseKeyword)
  );
}

