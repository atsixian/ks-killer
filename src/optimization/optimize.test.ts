/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import { SourceFile, SyntaxKind } from 'ts-morph';
import { optimizeNode } from '.';
import { getInfoFromText } from '../utils';

describe('Optimize', () => {
  it('should remove simple if with nested binary', () => {
    const { sourceFile } = getInfoFromText(`
       if ((true || A) && (true || B())) {
         s = 1;
       } 
    `);
    handleOptimize(sourceFile, SyntaxKind.IfStatement);
    expect(sourceFile.getText().trim()).toBe(`s = 1;`);
  });
  it('should remove simple if with nested conditional', () => {
    const { sourceFile } = getInfoFromText(`
       if ((false ? T() : (false && A())) ? T() : (true || A)) {
         s = 1;
       } 
    `);
    handleOptimize(sourceFile, SyntaxKind.IfStatement);
    expect(sourceFile.getText().trim()).toBe(`s = 1;`);
  });
});

function handleOptimize(sourceFile: SourceFile, kind: SyntaxKind) {
  sourceFile.getDescendantsOfKind(kind).forEach(optimizeNode);
}
