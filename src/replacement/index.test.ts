/*
 * @copyright Microsoft Corporation. All rights reserved.
 */

import { Project, SyntaxKind } from 'ts-morph';
import { findKSDeclaration } from '.';
import { getInfoFromText } from '../utils';

const KS_ID = 'cc6daf8f-3d72-4c85-adea-cbb098663992';
const project = new Project({ useInMemoryFileSystem: true });

// ks file
project.createSourceFile(
  'ks.ts',
  `
  import { _SPKillSwitch } from '@microsoft/sp-core-library';

  export function isTestKSActivated(): boolean {
    return _SPKillSwitch.isActivated(
      '${KS_ID}',
      /* '08/13/2020', 'Test KS' */
    );
  }

  export function isTestKSActivated2(): boolean {
    return _SPKillSwitch.isActivated(
      '${KS_ID}',
      /* '08/13/2020', 'Test KS2' */
    );
  }
  `
);

// reference file
project.createSourceFile(
  'app.ts',
  `
  import { isTestKSActivated } from './ks';

  function app() {
    if (isTestKSActivated()) {
      console.log('app inside');
    }
  }

  app();
  `
);

describe('Replace KS references with false', () => {
  it('should find KS declarations given an ID', () => {
    const ksFile = project.getSourceFileOrThrow('ks.ts');
    expect(findKSDeclaration(project, 'cc6daf8f-3d72-4c85-adea-cbb098663992')).toHaveLength(2);
    const sourceFile = project.getSourceFileOrThrow('app.ts');

    // expect(sourceFile.getText().trim()).toBe(
    //   `
    //   import { isTestKSActivated } from './ks';

    //   function app() {
    //     console.log('app inside');
    //   }

    //   app();
    //   `
    // );
  });
});
