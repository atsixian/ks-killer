import { IfStatement } from 'ts-morph';
import { unwrapBlock } from '../utils';

/*
 * @copyright Microsoft Corporation. All rights reserved.
 */
export function handleIf(ifStmt: IfStatement) {
  try {
    // check if our replacement introduces const conditions
    const cond = eval(ifStmt.getExpression().getText());

    // always true
    if (cond) {
      const thenBlock = ifStmt.getThenStatement();
      ifStmt.replaceWithText(unwrapBlock(thenBlock));
    } else {
      // always false
    }
  } catch (err) {
    // unable to optimize, skip
  }
}
