/*
 * @copyright Microsoft Corporation. All rights reserved.
 */


import { SourceFile, SyntaxKind } from 'ts-morph';
import { handleBinaryExp, optimize } from '.';
import { getInfoFromText } from '../utils';

describe('Binary Expression', () => {
  describe('Simple expression', () => {
    it('should handle && correctly', () => {
      const { sourceFile } = getInfoFromText(`
      true && A(), A() && true, false && A(), A() && false
    `);
      handleBinaryExps(sourceFile);
      expect(sourceFile.getText().trim()).toBe(`A(), A(), false, false`);
    });

    it('should handle || correctly', () => {
      const { sourceFile } = getInfoFromText(`
      true || A(), A() || true, false || A(), A() || false
    `);
      handleBinaryExps(sourceFile);
      expect(sourceFile.getText().trim()).toBe(`true, true, A(), A()`);
    });
  });

  describe('Nested expression', () => {
    it('should handle parent exp', () => {
      const { sourceFile } = getInfoFromText(`
         (true || A()) || B() 
      `);
      sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression).forEach(optimize);
      expect(sourceFile.getText().trim()).toBe(`true`);
    });
    it('should handle forgotten node', () => {
      const { sourceFile } = getInfoFromText(`
         (true || A()) || (true && B()) 
      `);
      sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression).forEach(optimize);
      expect(sourceFile.getText().trim()).toBe(`true`);
    });
  });
});

function handleBinaryExps(sourceFile: SourceFile) {
  sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression).forEach(handleBinaryExp);
}