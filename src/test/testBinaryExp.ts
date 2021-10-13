/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import { Project, SyntaxKind } from 'ts-morph';
import { handleBinaryExp } from '../elimination/binaryExp';

const project = new Project({
  tsConfigFilePath: './tsconfig.json'
});

const srcFile = project.getSourceFile('src/test/binaryExp.ts');
const binaryExps = srcFile.getDescendantsOfKind(SyntaxKind.BinaryExpression);

binaryExps.forEach(handleBinaryExp);

console.log(srcFile.print());
