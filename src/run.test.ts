import chalk from 'chalk';
import { Project } from 'ts-morph';
import { ICoreOptions } from './replacement';
import { runProject } from './run';

describe('Run', () => {
  let project: Project;
  const fileNames = ['KillSwitches.ts', 'Test1.ts', 'Test2.ts'];
  const mockConsole = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(mockConsole);
    project = new Project({ useInMemoryFileSystem: true });
    const ksFile = project.createSourceFile(
      'KillSwitches.ts',
      `import {_SPKillSwitch} from 'mock';

      export function isKS1Activated(): boolean {
        return _SPKillSwitch.isActivated(
          '39ededd5-f5aa-441c-9197-e312dea3ec45' /* '9/30/2021', 'Trailing comments' */
        );
      }

      export function isKS2Activated(): boolean {
        return _SPKillSwitch.isActivated(
          '206418a9-ae27-4fc7-86e0-6ec41bad3b3e'
          /* '10/30/2021', 'Block comments' */
        );
      }

      export function isKS3Activated(): boolean {
        return KillSwitch.isActivated(
          'fda23cae-fe14-4b03-84ee-500f20112dbe',
          '11/30/2021',
          'Second argument is date'
        );
      }`
    );
    ksFile.saveSync();

    const sourceFile1 = project.createSourceFile(
      'Test1.ts',
      `import { isKS1Activated, isKS2Activated, isKS3Activated } from './KillSwitches';

      if (!isKS1Activated()) {
        console.log('KS1 is not activated');
      } else {
        console.log('KS1 is activated');
      }

      const a = isKS2Activated() ? 'KS2 is activated' : 'KS2 is not activated';
      console.log(a);

      if (isKS3Activated()) {
        console.log('KS3 is activated');
      }`
    );
    sourceFile1.saveSync();

    const sourceFile2 = project.createSourceFile(
      'Test2.ts',
      `import { isKS1Activated, isKS2Activated } from './KillSwitches';

      if (!isKS1Activated()) {
        console.log('KS1 is not activated');
      }

      const b = !isKS2Activated() ? 'KS2 is not activated' : 'KS2 is activated';
      console.log(b);`
    );
    sourceFile2.saveSync();
  });

  it('should graduate by id', () => {
    const targetId = '39ededd5-f5aa-441c-9197-e312dea3ec45';

    const options: ICoreOptions = {
      targetId
    };

    runProject(project, options);

    expect(project.getSourceFileOrThrow('KillSwitches.ts').getText()).toBe(
      `import {_SPKillSwitch} from 'mock';

      export function isKS2Activated(): boolean {
        return _SPKillSwitch.isActivated(
          '206418a9-ae27-4fc7-86e0-6ec41bad3b3e'
          /* '10/30/2021', 'Block comments' */
        );
      }

      export function isKS3Activated(): boolean {
        return KillSwitch.isActivated(
          'fda23cae-fe14-4b03-84ee-500f20112dbe',
          '11/30/2021',
          'Second argument is date'
        );
      }`
    );

    expect(project.getSourceFileOrThrow('Test1.ts').getText()).toBe(
      `import { isKS2Activated, isKS3Activated } from './KillSwitches';

      console.log('KS1 is not activated');

      const a = isKS2Activated() ? 'KS2 is activated' : 'KS2 is not activated';
      console.log(a);

      if (isKS3Activated()) {
        console.log('KS3 is activated');
      }`
    );

    expect(project.getSourceFileOrThrow('Test2.ts').getText()).toBe(
      `import { isKS2Activated } from './KillSwitches';

      console.log('KS1 is not activated');

      const b = !isKS2Activated() ? 'KS2 is not activated' : 'KS2 is activated';
      console.log(b);`
    );

    expect(mockConsole).toHaveBeenLastCalledWith(chalk.green(`KS successfully graduated: \n${targetId}`));
  });

  it('should not change anything if no ks is found', () => {
    const options: ICoreOptions = {
      targetId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
    };
    const originalText = fileNames.map((f) => project.getSourceFileOrThrow(f).getText());

    runProject(project, options);

    expect(fileNames.map((f) => project.getSourceFileOrThrow(f).getText())).toEqual(originalText);
    expect(mockConsole).toHaveBeenCalledWith(chalk.red('No KS found.'));
  });

  it('should graduate every ks before thresholdDate', () => {
    const options: ICoreOptions = {
      thresholdDate: new Date('10/31/2021') // should graduate ks1 and ks2
    };

    runProject(project, options);

    expect(project.getSourceFileOrThrow('KillSwitches.ts').getText()).toBe(
      `import {_SPKillSwitch} from 'mock';

      export function isKS3Activated(): boolean {
        return KillSwitch.isActivated(
          'fda23cae-fe14-4b03-84ee-500f20112dbe',
          '11/30/2021',
          'Second argument is date'
        );
      }`
    );

    expect(project.getSourceFileOrThrow('Test1.ts').getText()).toBe(
      `import { isKS3Activated } from './KillSwitches';

      console.log('KS1 is not activated');

      const a = 'KS2 is not activated';
      console.log(a);

      if (isKS3Activated()) {
        console.log('KS3 is activated');
      }`
    );

    expect(project.getSourceFileOrThrow('Test2.ts').getText()).toBe(
      `console.log('KS1 is not activated');

      const b = 'KS2 is not activated';
      console.log(b);`
    );

    expect(mockConsole).toHaveBeenLastCalledWith(
      chalk.green(
        `KS successfully graduated: \n39ededd5-f5aa-441c-9197-e312dea3ec45\n206418a9-ae27-4fc7-86e0-6ec41bad3b3e`
      )
    );
  });
});
