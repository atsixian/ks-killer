/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import { Node, ts } from 'ts-morph';

/**
 * Determine if nodeA is an ancestor of nodeB
 */
export function isAncestorOf(nodeA: Node<ts.Node>, nodeB: Node<ts.Node>): boolean {
  return nodeB.getAncestors().includes(nodeA);
}
