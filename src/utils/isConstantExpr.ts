import { Node, SyntaxKind, ts } from 'ts-morph';

// True, false, null, undefined
// Number, -Number, BigInt, NaN, Infinity, -Infinity
// String(including `no substitution`)
// {}
// []

const CONSTANT_CHECKERS = [
  Node.isTrueLiteral,
  Node.isFalseLiteral,
  Node.isNullLiteral,
  Node.isStringLiteral,
  Node.isNoSubstitutionTemplateLiteral,
  isUndefined,
  isNaN,
  isNumber,
  isInfinity,
  isEmptyObject,
  isEmptyArray
];
const FALSY_CHECKERS = [Node.isFalseLiteral, Node.isNullLiteral, isUndefined, isNaN, isZero, isEmptyString];

function isUndefined(node: Node<ts.Node>): boolean {
  return node.asKind(SyntaxKind.Identifier)?.getText() === 'undefined';
}

function isNegativeNumericalLiteral(node: Node<ts.Node>) {
  const unaryExpr = node.asKind(SyntaxKind.PrefixUnaryExpression);
  return (
    unaryExpr && unaryExpr.getOperatorToken() === SyntaxKind.MinusToken && isNumber(unaryExpr.getOperand())
  );
}

function isNumber(node: Node<ts.Node>) {
  return isNumericalLiteral(node) || isNegativeNumericalLiteral(node);
}

function isNumericalLiteral(node: Node<ts.Node>): boolean {
  return Node.isNumericLiteral(node) || Node.isBigIntLiteral(node);
}

function isInfinity(node: Node<ts.Node>): boolean {
  return (
    node.asKind(SyntaxKind.Identifier)?.getText() === 'Infinity' ||
    node.asKind(SyntaxKind.PrefixUnaryExpression)?.getText() === '-Infinity'
  );
}

function isEmptyObject(node: Node<ts.Node>): boolean {
  return node.asKind(SyntaxKind.ObjectLiteralExpression)?.getProperties().length === 0;
}

function isEmptyArray(node: Node<ts.Node>): boolean {
  return node.asKind(SyntaxKind.ArrayLiteralExpression)?.getElements().length === 0;
}

function isNaN(node: Node<ts.Node>): boolean {
  return node.asKind(SyntaxKind.Identifier)?.getText() === 'NaN';
}

function isZero(node: Node<ts.Node>): boolean {
  return (
    node.asKind(SyntaxKind.NumericLiteral)?.getLiteralValue() === 0 || //0
    node.asKind(SyntaxKind.PrefixUnaryExpression)?.getText() === '-0' || // -0
    node.asKind(SyntaxKind.BigIntLiteral)?.getText() === '0n' // 0n
  );
}

function isEmptyString(node: Node<ts.Node>): boolean {
  return (
    node.asKind(SyntaxKind.StringLiteral)?.getLiteralText().length === 0 || // "" or ''
    node.asKind(SyntaxKind.NoSubstitutionTemplateLiteral)?.getLiteralText().length === 0 // ``
  );
}

export function isConstantExpr(node: Node<ts.Node> | undefined): boolean {
  if (!node) return false;
  return CONSTANT_CHECKERS.map((checker) => checker(node)).some((res) => res);
}

export function isFalsy(node: Node<ts.Node> | undefined): boolean {
  if (!node) return false;
  return FALSY_CHECKERS.map((checker) => checker(node)).some((res) => res);
}

export function isTruthyConstExpr(node: Node<ts.Node> | undefined) {
  return isConstantExpr(node) && !isFalsy(node);
}
