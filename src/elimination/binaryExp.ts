/*
 * @copyright Microsoft Corporation. All rights reserved.
 */
import { BinaryExpression, SyntaxKind } from 'ts-morph';

export function handleBinaryExp(exp: BinaryExpression) {
  const operator = exp.getOperatorToken().getKind();

  if (operator === SyntaxKind.AmpersandAmpersandToken) {
    // false && A => false
    // will be remvoed in the next step
    if (exp.getFirstChildByKind(SyntaxKind.FalseKeyword)) {
      const newExp = exp.replaceWithText('false');
    } else {
      simplify(exp, SyntaxKind.TrueKeyword);
    }
  } else if (operator === SyntaxKind.BarBarToken) {
    if (exp.getFirstChildByKind(SyntaxKind.TrueKeyword)) {
      exp.replaceWithText('true');
    } else {
      simplify(exp, SyntaxKind.FalseKeyword);
    }
  }
}

function simplify(exp: BinaryExpression, keyword: SyntaxKind.TrueKeyword | SyntaxKind.FalseKeyword): void {
  if (exp.getFirstChildByKind(keyword)) {
    const lhs = exp.getLeft();
    const rhs = exp.getRight();
    if (lhs.getKind() === keyword) {
      exp.replaceWithText(rhs.getText());
    } else {
      exp.replaceWithText(lhs.getText());
    }
  }
}
