/*
 * @copyright Microsoft Corporation. All rights reserved.
 */
import { BinaryExpression, SyntaxKind, Node, ts } from 'ts-morph';
import { HandlerReturnType } from './optimize';
import { isConstantExpr, isFalsy, tryUnwrapParenthese } from '../utils';

const isTruthy = (node: Node<ts.Node>) => isConstantExpr(node) && !isFalsy(node);

export function handleBinaryExp(exp: BinaryExpression): HandlerReturnType {
  const operator = exp.getOperatorToken().getKind();
  let newWork: HandlerReturnType;
  if (operator === SyntaxKind.AmpersandAmpersandToken) {
    newWork = exp.getFirstChild(isFalsy) // if there's a falsy child
      ? exp.replaceWithText('false')
      : simplify(exp, isTruthy);
  } else if (operator === SyntaxKind.BarBarToken) {
    newWork = exp.getFirstChild(isTruthy) ? exp.replaceWithText('true') : simplify(exp, isFalsy);
  }
  return tryUnwrapParenthese(newWork);
}

function simplify(exp: BinaryExpression, cond: (node: Node<ts.Node>) => boolean): HandlerReturnType {
  if (exp.getFirstChild(cond)) {
    const lhs = exp.getLeft();
    const rhs = exp.getRight();
    return cond(lhs) ? exp.replaceWithText(rhs.getText()) : exp.replaceWithText(lhs.getText());
  }
}
