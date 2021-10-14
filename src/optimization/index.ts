/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import { SyntaxKind, ts } from '@ts-morph/common';
import { BinaryExpression, ConditionalExpression, IfStatement, Node } from 'ts-morph';

import { handleBinaryExp } from './binaryExp';
import { handleConditionalExp } from './conditionalExp';
import { handleIf } from './if';

export type HandlerReturnType = Node<ts.Node> | undefined;

export function optimize(node: Node<ts.Node>) {
  if (!node || node.wasForgotten()) return;
  let newWork: HandlerReturnType;
  switch (node.getKind()) {
    case SyntaxKind.BinaryExpression:
      newWork = handleBinaryExp(node as BinaryExpression);
      break;
    case SyntaxKind.ConditionalExpression:
      handleConditionalExp(node as ConditionalExpression);
      break;
    case SyntaxKind.IfStatement:
      handleIf(node as IfStatement);
      break;
  }
  // if there's any optimizatio happened
  if (newWork) {
    optimize(newWork.getParent());
  }
}

export * from './binaryExp';
export * from './if';

