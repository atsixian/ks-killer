import { SyntaxKind } from "@ts-morph/common";
import { getInfoFromText } from ".";
import { isFalsy } from "./isFalsy";

describe('isFalsy', () => {
    const { sourceFile } = getInfoFromText(`
        false; null; undefined; 0; -0; 0n; NaN; ""; ''; \`\`;
    `);
    const exprs = sourceFile.getChildrenOfKind(SyntaxKind.ExpressionStatement)
    it.each(
        exprs.map(expr => ({ name: expr.getFirstChild().getText(), node: expr.getFirstChild() }))
    )(`$name`, ({ name, node }) => {
        expect(isFalsy(node)).toBeFalsy()
    });
});