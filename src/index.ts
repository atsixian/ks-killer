/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import path from 'path';
import chalk from 'chalk';
import { Project } from 'ts-morph';

import { optimize } from './optimization';
import { findKSDeclaration, replaceFunCallWithFalse, ICoreOptions } from './replacement';

export function run(projectPath: string, options: ICoreOptions) {
  const project = new Project();
  project.addSourceFilesAtPaths(path.join(projectPath, `src/**/*.{ts,tsx}`));
  const { ksDecls, guids } = findKSDeclaration(project, options);
  // TODO: check if the KS is activated. If so, do thing.
  if (!ksDecls.length) {
    console.log(chalk.red(`No KS found.`));
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

  console.log(chalk.green(`KS successfully graduated: \n${guids.join('\n')}`));
  project.save();
}
