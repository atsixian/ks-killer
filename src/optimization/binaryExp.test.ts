/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import { SyntaxKind } from 'ts-morph';
import { optimizeNode } from '.';
import { getInfoFromText } from '../utils';
import { falsyValues, truthyValues } from '../utils/isConstantExpr.test';
import { handleBinaryExp } from './binaryExp';

describe('Binary Expression', () => {
  describe('Handle &&', () => {
    it.each(truthyValues)('should handle && correctly for truthy value %s on LHS', (value) => {
      let node = getInfoFromText(`${value} && A()`).firstChild.getFirstChildIfKind(
        SyntaxKind.BinaryExpression
      );
      const res = handleBinaryExp(node);
      expect(res.getText() === `A()`).toBeTruthy();
    });

    it.each(truthyValues)('should handle && correctly for truthy value %s on RHS', (value) => {
      let node = getInfoFromText(`A() && ${value}`).firstChild.getFirstChildIfKind(
        SyntaxKind.BinaryExpression
      );
      const res = handleBinaryExp(node);
      expect(res.getText() === 'A()').toBeTruthy();
    });

    it.each(falsyValues)('should handle && correctly for falsy value %s on LHS', (value) => {
      let node = getInfoFromText(`${value} && A()`).firstChild.getFirstChildIfKind(
        SyntaxKind.BinaryExpression
      );
      const res = handleBinaryExp(node);
      expect(res.getText() === `false`).toBeTruthy();
    });

    it.each(falsyValues)('should handle && correctly for falsy value %s on RHS', (value) => {
      let node = getInfoFromText(`A() && ${value}`).firstChild.getFirstChildIfKind(
        SyntaxKind.BinaryExpression
      );
      const res = handleBinaryExp(node);
      expect(res.getText() === `false`).toBeTruthy();
    });
  });

  describe('Handle ||', () => {
    it.each(truthyValues)('should handle || correctly for truthy value %s on LHS', (value) => {
      let node = getInfoFromText(`${value} || A()`).firstChild.getFirstChildIfKind(
        SyntaxKind.BinaryExpression
      );
      const res = handleBinaryExp(node);
      expect(res.getText() === `true`).toBeTruthy();
    });

    it.each(truthyValues)('should handle || correctly for truthy value %s on RHS', (value) => {
      let node = getInfoFromText(`A() || ${value}`).firstChild.getFirstChildIfKind(
        SyntaxKind.BinaryExpression
      );
      const res = handleBinaryExp(node);
      expect(res.getText() === `true`).toBeTruthy();
    });

    it.each(falsyValues)('should handle || correctly for falsy value %s on LHS', (value) => {
      let node = getInfoFromText(`${value} || A()`).firstChild.getFirstChildIfKind(
        SyntaxKind.BinaryExpression
      );
      const res = handleBinaryExp(node);
      expect(res.getText() === `A()`).toBeTruthy();
    });

    it.each(falsyValues)('should handle || correctly for falsy value %s on RHS', (value) => {
      let node = getInfoFromText(`A() || ${value}`).firstChild.getFirstChildIfKind(
        SyntaxKind.BinaryExpression
      );
      const res = handleBinaryExp(node);
      expect(res.getText() === `A()`).toBeTruthy();
    });
  });

  describe('Nested expression', () => {
    it('should handle parent exp', () => {
      const { sourceFile } = getInfoFromText(`
         (true || A()) || B() 
      `);
      sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression).forEach(optimizeNode);
      expect(sourceFile.getText().trim()).toBe(`true`);
    });
    it('should handle forgotten node', () => {
      const { sourceFile } = getInfoFromText(`
         (true || A()) || (true && B()) 
      `);
      sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression).forEach(optimizeNode);
      expect(sourceFile.getText().trim()).toBe(`true`);
    });
  });
});
