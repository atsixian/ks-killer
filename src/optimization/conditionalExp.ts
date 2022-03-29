/*
 * @copyright Microsoft Corporation. All rights reserved.
 */
import { ConditionalExpression, SyntaxKind } from 'ts-morph';
import { tryReplaceParentParentheses } from '../utils';
import { HandlerReturnType } from './optimize';

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
