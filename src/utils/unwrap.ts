import { Statement, Block, Node, ts, SyntaxKind } from 'ts-morph';
import { HandlerReturnType } from '../optimization';

export function unwrapBlock(target: Statement | Block): string {
  // https://github.com/dsherret/ts-morph/issues/641
  return target.getChildSyntaxListOrThrow().getFullText().trim();
}

/**
 * Replace a ParenthesizedExpression from bottom up
 */
export function tryReplaceParentParentheses(node: Node<ts.Node> | undefined): HandlerReturnType {
  if (node && node.getParentIfKind(SyntaxKind.ParenthesizedExpression)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return node.getParent()!.replaceWithText(node.getText());
  }
  return node;
}

/**
 * Unwrap a ParenthesizedExpression from top to bottom
 */
export function tryUnwrapParentheses(node: Node<ts.Node>): Node<ts.Node> {
  const innerExpr = node.asKind(SyntaxKind.ParenthesizedExpression)?.getExpression();
  if (innerExpr) {
    return tryUnwrapParentheses(innerExpr);
  }
  return node;
}
