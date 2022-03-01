/*
 * @copyright Microsoft Corporation. All rights reserved.
 */
import { ConditionalExpression, SyntaxKind, Node, ts } from 'ts-morph';
import { HandlerReturnType } from './optimize';
import { tryReplaceParentParentheses } from '../utils';

export function handleConditionalExp(exp: ConditionalExpression): HandlerReturnType {
  const cond = exp.getCondition();
  let newWork: HandlerReturnType;
  if (cond.getKind() === SyntaxKind.TrueKeyword) {
    newWork = exp.replaceWithText(exp.getWhenTrue().getText());
  } else if (cond.getKind() === SyntaxKind.FalseKeyword) {
    newWork = exp.replaceWithText(exp.getWhenFalse().getText());
  }
  return tryReplaceParentParentheses(newWork);
}
