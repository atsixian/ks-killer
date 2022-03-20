/*
 * @copyright Microsoft Corporation. All rights reserved.
 */
import { BinaryExpression, Node, SyntaxKind, ts } from 'ts-morph';
import { isFalsy, isTruthyConstExpr, tryReplaceParentParentheses } from '../utils';
import { HandlerReturnType } from './optimize';

export function handleBinaryExp(exp: BinaryExpression): HandlerReturnType {
  const operator = exp.getOperatorToken().getKind();
  let newWork: HandlerReturnType;
  if (operator === SyntaxKind.AmpersandAmpersandToken) {
    newWork = exp.getFirstChild(isFalsy) // if there's a falsy child
      ? exp.replaceWithText('false')
      : simplify(exp, isTruthyConstExpr);
  } else if (operator === SyntaxKind.BarBarToken) {
    newWork = exp.getFirstChild(isTruthyConstExpr) ? exp.replaceWithText('true') : simplify(exp, isFalsy);
  }
  return tryReplaceParentParentheses(newWork);
}

function simplify(exp: BinaryExpression, cond: (node: Node<ts.Node>) => boolean): HandlerReturnType {
  if (exp.getFirstChild(cond)) {
    const lhs = exp.getLeft();
    const rhs = exp.getRight();
    return cond(lhs) ? exp.replaceWithText(rhs.getText()) : exp.replaceWithText(lhs.getText());
  }
}
