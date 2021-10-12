/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import { BinaryExpression, SyntaxKind } from 'ts-morph';

export function handleBinary(exp: BinaryExpression) {
  const operator = exp.getOperatorToken().getKind();
  const lhs = exp.getLeft();
  const rhs = exp.getRight();

  if (operator === SyntaxKind.AmpersandAmpersandToken) {
    // false && A => false
    // will be remvoed in the next step
    if (exp.getFirstChildByKind(SyntaxKind.FalseKeyword)) {
      exp.replaceWithText('false');
    } else if (exp.getFirstChildByKind(SyntaxKind.TrueKeyword)) {
      if (lhs.getKind() === SyntaxKind.TrueKeyword) {
        exp.replaceWithText(rhs.getText());
      } else {
        exp.replaceWithText(lhs.getText());
      }
    }
  } else if (operator === SyntaxKind.BarBarToken) {
    if (exp.getLeft().getKind() === SyntaxKind.TrueKeyword) {
      console.log('||');
    }
  }
}
