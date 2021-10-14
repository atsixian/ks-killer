/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import { SourceFile, SyntaxKind } from 'ts-morph';
import { optimize } from './optimize';
import { getInfoFromText } from '../utils';
import { handleConditionalExp } from './conditionalExp';

describe('Conditional Expression', () => {
  describe('Simple conditional', () => {
    it('should remove else branch when cond is always true', () => {
      const { sourceFile } = getInfoFromText(`
        true ? A() : B
    `);
      handleCondExps(sourceFile);
      expect(sourceFile.getText().trim()).toBe(`A()`);
    });
    it('should remove then branch when cond is always false', () => {
      const { sourceFile } = getInfoFromText(`
        false ? A() : B
    `);
      handleCondExps(sourceFile);
      expect(sourceFile.getText().trim()).toBe(`B`);
    });
  });

  describe('Nested conditional', () => {
    it('should handle nested conditionals', () => {
      const { sourceFile } = getInfoFromText(`
        (true ? A() : B()) ? C() : (false ? D() : E())
      `);
      handleCondExps(sourceFile, true);
      expect(sourceFile.getText().trim()).toBe(`A() ? C() : E()`);
    });
    it('should handle && expression parent', () => {
      const { sourceFile } = getInfoFromText(`
        (true ? true : B()) || C     
      `);
      handleCondExps(sourceFile, true);
      expect(sourceFile.getText().trim()).toBe(`true`);
    });
    it('should handle || expression parent', () => {
      const { sourceFile } = getInfoFromText(`
        (true ? true : B()) && C     
      `);
      handleCondExps(sourceFile, true);
      expect(sourceFile.getText().trim()).toBe(`C`);
    });
  });
});

function handleCondExps(sourceFile: SourceFile, nested: boolean = false) {
  sourceFile
    .getDescendantsOfKind(SyntaxKind.ConditionalExpression)
    .forEach(nested ? optimize : handleConditionalExp);
}
