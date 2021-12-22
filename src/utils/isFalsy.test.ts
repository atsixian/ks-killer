import { SyntaxKind } from "@ts-morph/common";
import { getInfoFromText } from ".";
import { isFalsy } from "./isConstantExpr";

describe('isFalsy', () => {
    // https://developer.mozilla.org/en-US/docs/Glossary/Falsy
    const { sourceFile } = getInfoFromText(`
        false; null; undefined; 0; -0; 0n; NaN; ""; ''; \`\`;
    `);
    const exprs = sourceFile.getChildrenOfKind(SyntaxKind.ExpressionStatement)
    it.each(
        exprs.map(expr => ({ name: expr.getFirstChild().getText(), node: expr.getFirstChild() }))
    )(`$name`, ({ node }) => {
      expect(isFalsy(node)).toBeTruthy()
    });
});