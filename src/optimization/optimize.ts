/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import { BinaryExpression, ConditionalExpression, IfStatement, Node, SyntaxKind, ts } from 'ts-morph';
import { handleBinaryExp } from './binaryExp';
import { handleConditionalExp } from './conditionalExp';
import { handleIf } from './if';

export type HandlerReturnType = Node<ts.Node> | undefined;

export function optimize(nodes: Set<Node<ts.Node>>) {
  nodes.forEach(optimizeNode);
}

export function optimizeNode(node: Node<ts.Node>) {
  if (!node || node.wasForgotten()) return;
  let newWork: HandlerReturnType;
  switch (node.getKind()) {
    case SyntaxKind.BinaryExpression:
      newWork = handleBinaryExp(node as BinaryExpression);
      break;
    case SyntaxKind.ConditionalExpression:
      newWork = handleConditionalExp(node as ConditionalExpression);
      break;
    case SyntaxKind.IfStatement:
      handleIf(node as IfStatement);
      break;
  }
  // if there's any optimization happened
  if (newWork) {
    optimizeNode(newWork.getParent());
  }
}
