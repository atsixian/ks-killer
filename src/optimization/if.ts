/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import { IfStatement } from 'ts-morph';
import { unwrapBlock } from '../utils';

export function handleIf(ifStmt: IfStatement): void {
  try {
    // check if our replacement introduces const conditions
    const cond = eval(ifStmt.getExpression().getText());

    // always true
    if (cond) {
      const thenBlock = ifStmt.getThenStatement();
      ifStmt.replaceWithText(unwrapBlock(thenBlock));
    } else {
      // always false
      const elseBlock = ifStmt.getElseStatement();
      if (!elseBlock) {
        ifStmt.remove();
      } else {
        ifStmt.replaceWithText(unwrapBlock(elseBlock));
      }
    }
  } catch (err) {
    // unable to optimize, skip
  }
}
