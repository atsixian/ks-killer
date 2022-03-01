import { SyntaxKind } from '@ts-morph/common';
import { getInfoFromText, isTruthyConstExpr } from '.';
import { isFalsy } from './isConstantExpr';

describe('isFalsy', () => {
  // https://developer.mozilla.org/en-US/docs/Glossary/Falsy
  const { sourceFile } = getInfoFromText(`
        false; null; undefined; 0; -0; 0n; NaN; ""; ''; \`\`;
    `);
  const exprs = sourceFile.getChildrenOfKind(SyntaxKind.ExpressionStatement);
  it.each(exprs.map((expr) => ({ name: expr.getFirstChild().getText(), node: expr.getFirstChild() })))(
    `$name`,
    ({ node }) => {
      expect(isFalsy(node)).toBeTruthy();
    }
  );
});

describe('isTruthyConstExpr', () => {
  // https://developer.mozilla.org/en-US/docs/Glossary/Falsy
  const { sourceFile } = getInfoFromText(`
      true; {}; []; 17; -17; "0"; "false"; 12n; -12n; 3.14; -3.14; Infinity; -Infinity;
  `);
  const exprs = sourceFile.getChildrenOfKind(SyntaxKind.ExpressionStatement);
  it.each(exprs.map((expr) => ({ name: expr.getFirstChild().getText(), node: expr.getFirstChild() })))(
    `$name`,
    ({ node }) => {
      expect(isTruthyConstExpr(node)).toBeTruthy();
    }
  );
});
