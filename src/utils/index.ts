/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import { Block, Node, ReferenceEntry, Statement, SyntaxKind, ts } from 'ts-morph';
import { HandlerReturnType } from '../optimization';

/**
 * Determine if nodeA is an ancestor of nodeB
 */
export function isAncestorOf(nodeA: Node<ts.Node>, nodeB: Node<ts.Node>): boolean {
  return nodeB.getAncestors().includes(nodeA);
}

export function unwrapBlock(target: Statement | Block): string {
  // https://github.com/dsherret/ts-morph/issues/641
  return target.getChildSyntaxListOrThrow().getText({ trimLeadingIndentation: true });
}

export function tryUnwrapParenthese(node: Node<ts.Node>): HandlerReturnType {
  if (node && node.getParentIfKind(SyntaxKind.ParenthesizedExpression)) {
    return node.getParent().replaceWithText(node.getText());
  }
}

export function printReference(reference: ReferenceEntry) {
  console.log('---------');
  console.log('REFERENCE');
  console.log('---------');
  console.log(`File path:  ${reference.getSourceFile().getFilePath()}`);
  console.log(`Start: ${reference.getTextSpan().getStart()}`);
  console.log(`Length: ${reference.getTextSpan().getLength()}`);
  console.log(`Parent kind: ${reference.getNode().getParentOrThrow().getKindName()}`);
  console.log('\n');
}

export * from './getInfoFromText';
