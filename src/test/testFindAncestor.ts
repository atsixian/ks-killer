/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import { Project, SyntaxKind } from 'ts-morph';
import { isAncestorOf } from '../utils';

const project = new Project({
  tsConfigFilePath: './tsconfig.json'
});

const srcFile = project.getSourceFile('src/test/ancestor.ts');
console.log(srcFile);

const callExpr = srcFile.getFirstDescendantByKind(SyntaxKind.CallExpression);
const ifs = callExpr.getFirstAncestorByKind(SyntaxKind.IfStatement);
const block = callExpr.getFirstAncestorByKind(SyntaxKind.Block);
console.log(isAncestorOf(ifs, block)); //true
