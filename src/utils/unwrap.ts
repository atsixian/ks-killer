import { Statement, Block, Node, ts, SyntaxKind } from 'ts-morph';
import { HandlerReturnType } from '../optimization';

export function unwrapBlock(target: Statement | Block): string {
  // https://github.com/dsherret/ts-morph/issues/641
  return target.getChildSyntaxListOrThrow().getText({ trimLeadingIndentation: true });
}

/**
 * Replace a ParenthesizedExpression from bottom up
 */
export function tryReplaceParentParentheses(node: Node<ts.Node>): HandlerReturnType {
  if (node && node.getParentIfKind(SyntaxKind.ParenthesizedExpression)) {
    return node.getParent().replaceWithText(node.getText());
  }
  return node;
}