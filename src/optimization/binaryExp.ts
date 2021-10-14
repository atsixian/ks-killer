/*
 * @copyright Microsoft Corporation. All rights reserved.
 */
import { BinaryExpression, SyntaxKind, Node, ts } from 'ts-morph';
import { HandlerReturnType } from '.';
import { tryUnwrapParenthese } from '../utils';

export function handleBinaryExp(exp: BinaryExpression): HandlerReturnType {
  const operator = exp.getOperatorToken().getKind();
  let newWork: HandlerReturnType;
  if (operator === SyntaxKind.AmpersandAmpersandToken) {
    newWork = exp.getFirstChildByKind(SyntaxKind.FalseKeyword)
      ? exp.replaceWithText('false')
      : simplify(exp, SyntaxKind.TrueKeyword);
  } else if (operator === SyntaxKind.BarBarToken) {
    newWork = exp.getFirstChildByKind(SyntaxKind.TrueKeyword)
      ? exp.replaceWithText('true')
      : simplify(exp, SyntaxKind.FalseKeyword);
  }
  if (newWork && newWork.getParentIfKind(SyntaxKind.ParenthesizedExpression)) {
    newWork = newWork.getParent().replaceWithText(newWork.getText());
  }
  return tryUnwrapParenthese(newWork);
}

function simplify(
  exp: BinaryExpression,
  keyword: SyntaxKind.TrueKeyword | SyntaxKind.FalseKeyword
): HandlerReturnType {
  if (exp.getFirstChildByKind(keyword)) {
    const lhs = exp.getLeft();
    const rhs = exp.getRight();
    return lhs.getKind() === keyword
      ? exp.replaceWithText(rhs.getText())
      : exp.replaceWithText(lhs.getText());
  }
}
