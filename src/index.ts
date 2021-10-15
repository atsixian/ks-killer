/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import path from 'path';

import { Project } from 'ts-morph';

import { optimize } from './optimization';
import { findKSDeclaration, replaceFunCallWithFalse } from './replacement';

export function run(id: string, projectPath: string, ksFilePath?: string) {
  const project = new Project();
  project.addSourceFilesAtPaths(path.join(projectPath, `src/**/*.{ts,tsx}`));
  const ksDecls = findKSDeclaration(project, id, ksFilePath);
  // TODO check if the KS is actived. If so, do thing.
  if (!ksDecls.length) {
    console.log(`No KS found. Is the ID ${id} correct?`);
    return;
  }
  ksDecls.map(replaceFunCallWithFalse).forEach(optimize);
  project.save();
}
