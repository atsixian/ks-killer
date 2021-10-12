/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import * as path from 'path';
import { Project, ReferenceEntry, SyntaxKind } from 'ts-morph';

const patternMap = new Map<string, number>();

const projectDir = `C:/Users/sixianli/Documents/Code/odsp-web/sp-client/topics/sp-topic-viewer-webpart/src`;
const project = new Project();

project.addSourceFilesAtPaths(path.join(projectDir, `**/*{.ts,.tsx}`));

const ksFile = project.getSourceFileOrThrow(path.join(projectDir, 'common/KillSwitches.ts'));

const componentFiles = project.getSourceFiles(path.join(projectDir, 'components/**/*{.ts,.tsx}'));
// console.log(componentFiles.length);

const funDecls = ksFile.getChildrenOfKind(SyntaxKind.FunctionDeclaration);
// console.log(funDecls.length);

funDecls.forEach((f) => {
  console.log(
    `==============================================================================\n${f.getName()}`
  );
  f.findReferences().forEach((refSymbol) =>
    refSymbol.getReferences().forEach((f) => {
      classify(f);
      printReference(f);
    })
  );
});

function printReference(reference: ReferenceEntry) {
  console.log('---------');
  console.log('REFERENCE');
  console.log('---------');
  console.log('File path: ' + reference.getSourceFile().getFilePath());
  console.log('Start: ' + reference.getTextSpan().getStart());
  console.log('Length: ' + reference.getTextSpan().getLength());
  console.log('Parent kind: ' + reference.getNode().getParentOrThrow().getParentOrThrow().getKindName());
  console.log(
    'Ancestor kind: ' +
      reference
        .getNode()
        .getAncestors()
        .map((anc) => anc.getKindName())
  );
  console.log('\n');
}
function classify(ref: ReferenceEntry) {
  // get the sequence string
  const seqString = ref
    .getNode()
    .getAncestors()
    .map((anc) => anc.getKindName())
    .slice(0, 3)
    .join();
  patternMap.set(seqString, patternMap.get(seqString) === undefined ? 1 : patternMap.get(seqString) + 1);
}

// ignore imports and decls
patternMap.delete('ImportSpecifier,NamedImports,ImportClause');
patternMap.delete('FunctionDeclaration,SourceFile');
const sortedMap = new Map([...patternMap].sort((a, b) => b[1] - a[1]));
console.log(sortedMap);
