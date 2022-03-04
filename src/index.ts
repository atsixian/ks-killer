/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import path from 'path';

import { Project } from 'ts-morph';

import { optimize } from './optimization';
import { findKSDeclaration, replaceFunCallWithFalse, ICoreParameter } from './replacement';

export function run(projectPath: string, object: ICoreParameter) {
  const project = new Project();
  project.addSourceFilesAtPaths(path.join(projectPath, `src/**/*.{ts,tsx}`));
  const ksDecls = findKSDeclaration(project, object);
  // TODO: check if the KS is activated. If so, do thing.
  if (!ksDecls.length) {
    console.log(`No KS found.`);
    return;
  }
  ksDecls.map(replaceFunCallWithFalse).forEach(({ workList, refFiles }) => {
    optimize(workList);

    // run while new changes happened
    let changed: boolean;
    do {
      changed = false;
      refFiles.forEach((f) => {
        const lastWidth = f.getFullWidth();
        f.fixUnusedIdentifiers();
        if (f.getFullWidth() !== lastWidth) {
          changed = true;
        }
      });
    } while (changed);
  });
  // remove KS function declarations
  ksDecls.forEach((decl) => decl.remove());
  project.save();
}
