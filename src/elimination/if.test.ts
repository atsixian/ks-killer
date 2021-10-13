/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import { SourceFile, SyntaxKind } from 'ts-morph';
import { getInfoFromText } from '../utils/getInfoFromText';
import { handleIf } from './if';
describe('If', () => {
  describe('Simple if without else', () => {
    it('should remove whole if when cond is always true', () => {
      const { sourceFile } = getInfoFromText(`
        if (true) { s = 1; }
      `);
      handleIfs(sourceFile);
      expect(sourceFile.getText().trim()).toBe(`s = 1;`);
    });

    it('should remove whole block when cond is always false', () => {
      const { sourceFile } = getInfoFromText(`
        if (false) { s = 2; }
    `);
      handleIfs(sourceFile);
      expect(sourceFile.getText().trim()).toBe(``);
    });
  });

  describe('If Else', () => {
    it('should remove else block when cond is always true', () => {
      const { sourceFile } = getInfoFromText(`
      if (!false) {
        console.log('hello');
      } else {
        console.log('never reached');
      }
      `);
      handleIfs(sourceFile);
      expect(sourceFile.getText().trim()).toBe(`console.log('hello');`);
    });

    it('should replace if with else block when cond is always false', () => {
      const { sourceFile } = getInfoFromText(`
          if (false) {
            s = 1;
          } else {
            s = 2;
          }
      `);
      handleIfs(sourceFile);
      expect(sourceFile.getText().trim()).toBe(`s = 2;`);
    });
  });
});

function handleIfs(sourceFile: SourceFile) {
  sourceFile.getDescendantsOfKind(SyntaxKind.IfStatement).forEach(handleIf);
}
