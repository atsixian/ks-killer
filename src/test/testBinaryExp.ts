/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import { BinaryExpression, Project, SyntaxKind } from 'ts-morph';
import { handleBinary } from '../elimination/binaryExp';

const project = new Project({
  tsConfigFilePath: './tsconfig.json'
});

const srcFile = project.getSourceFile('src/test/binaryExp.ts');
const binaryExps = srcFile.getDescendantsOfKind(SyntaxKind.BinaryExpression);

binaryExps.forEach(handleBinary);

console.log(srcFile.print());
