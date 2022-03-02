import { ReferenceEntry } from 'ts-morph';

export function printReference(reference: ReferenceEntry) {
  console.log('---------');
  console.log('REFERENCE');
  console.log('---------');
  console.log(`File path:  ${reference.getSourceFile().getFilePath()}`);
  console.log(`Start: ${reference.getTextSpan().getStart()}`);
  console.log(`Length: ${reference.getTextSpan().getLength()}`);
  console.log(`Parent kind: ${reference.getNode().getParentOrThrow().getKindName()}`);
  console.log('\n');
}