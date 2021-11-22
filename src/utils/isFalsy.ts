// const FALSY_VALUES: Set<SyntaxKind> = new Set([SyntaxKind.FalseKeyword, SyntaxKind.NullKeyword, SyntaxKind.UndefinedKeyword

import { Node, SyntaxKind, ts } from 'ts-morph';

function isZero(node: Node<ts.Node> | undefined): boolean {
  if (!node) return false;
  return (
    (node.asKind(SyntaxKind.NumericLiteral)?.getLiteralValue() === 0) || //0
    (node.asKind(SyntaxKind.PrefixUnaryExpression)?.getText() === '-0') || // -0
    (node.asKind(SyntaxKind.BigIntLiteral)?.getText() === '0n') // 0n
  );
}

function isEmptyString(node: Node<ts.Node>): boolean {
  if (!node) return false;
  return (
    (node.asKind(SyntaxKind.StringLiteral)?.getLiteralText().length === 0) || // "" or ''
    (node.asKind(SyntaxKind.NoSubstitutionTemplateLiteral)?.getLiteralText().length === 0) // ``
  );
}

function isUndefined(node: Node<ts.Node>): boolean {
  if (!node) return false;
  return node.asKind(SyntaxKind.Identifier)?.getText() === 'undefined'
}

function isNaN(node: Node<ts.Node>): boolean {
  if (!node) return false;
  return node.asKind(SyntaxKind.Identifier)?.getText() === 'NaN'
}

export function isFalsy(node: Node<ts.Node>): boolean {
  return Node.isFalseLiteral(node) || Node.isNullLiteral(node) || isUndefined(node) || isNaN(node) || isZero(node) || isEmptyString(node)
}
