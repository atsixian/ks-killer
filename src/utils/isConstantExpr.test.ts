import { SyntaxKind } from '@ts-morph/common';
import { getInfoFromText, isTruthyConstExpr, tryUnwrapParenthese } from '.';
import { isFalsy } from './isConstantExpr';

// https://developer.mozilla.org/en-US/docs/Glossary/Truthy
const truthyValues = [
  'true',
  '({})',
  '[]',
  '42',
  `'0'`,
  `'false'`,
  // 'new Date()', not handled for now
  '-42',
  '12n',
  '3.14',
  '-3.14',
  'Infinity',
  '-Infinity'
];

// https://developer.mozilla.org/en-US/docs/Glossary/Falsy
const falsyValues = ['false', 'null', 'undefined', '0', '-0', '0n', 'NaN', `""`, `''`, '``'];

describe('isFalsy', () => {
  it.each(falsyValues)('%s', (value) => {
    const node = getInfoFromText(value).firstChild.getFirstChild();
    expect(isFalsy(node)).toBeTruthy();
  });
});

describe('isTruthyConstExpr', () => {
  it.each(truthyValues)('%s', (value) => {
    let node = getInfoFromText(value).firstChild.getFirstChild();
    // Need to unwrap parenthesized expressions
    if (value === '({})') {
      node = node.asKind(SyntaxKind.ParenthesizedExpression)?.getExpression();
    }
    expect(isTruthyConstExpr(node)).toBeTruthy();
  });
});
