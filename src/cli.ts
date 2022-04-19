/*
 * @copyright Microsoft Corporation. All rights reserved.
 */
import { validate as uuidValidate } from 'uuid';
import yargs from 'yargs/yargs';
import { run } from './run';

interface IArguments {
  ID: string | undefined;
  beforeDate: string | undefined;
  projectPath: string;
  ksFilePath: string | undefined;
}

const argv: IArguments = yargs(process.argv.slice(2))
  .scriptName('ks-killer')
  .usage('Usage:\n$0 <ks-id>\n$0 --id <ks-id>\n$0 --before-date <date>')
  .example([
    ['$0 39ededd5-f5aa-441c-9197-e312dea3ec45'],
    ['$0 --id 39ededd5-f5aa-441c-9197-e312dea3ec45'],
    ['$0 --before-date 02/28/2022']
  ])
  .showHelpOnFail(true)
  .option('ID', {
    alias: ['id'],
    describe: 'ID of the KS to graduate',
    type: 'string'
  })
  .option('beforeDate', {
    alias: ['before-date'],
    type: 'string',
    describe: 'Graduate ks before the specific date. e.g. MM/DD/YYYY'
  })
  .option('projectPath', {
    alias: ['project-Path', 'p'],
    type: 'string',
    describe: 'Target project to clean. Default to cwd.',
    default: process.cwd()
  })
  .option('ksFilePath', {
    alias: ['ks-File-Path', 'k'],
    type: 'string',
    describe: 'The file path of the KS. This boosts performance.'
  })
  .conflicts('ID', 'beforeDate')
  .check((argv) => {
    if (argv.ID || argv.beforeDate) {
      if (argv.ID && !uuidValidate(argv.ID)) {
        throw new Error('Error: please provide a valid ks-ID (uuid)');
      }
      if (argv.beforeDate && isNaN(Date.parse(argv.beforeDate))) {
        throw new Error('Error: please provide a valid date (e.g. MM/DD/YYYY)');
      }
      return true;
    } else if (argv['_'][0]) {
      if (uuidValidate(argv['_'][0]?.toString())) {
        argv.ID = argv['_'][0]?.toString();
        return true;
      }
      throw new Error('Error: please provide a valid ks-ID (uuid)');
    } else {
      throw new Error('Error: please provide either ksid(--id) or date(--before-date)');
    }
  })
  .help().argv;

const { ID, projectPath, ksFilePath, beforeDate } = argv;

run(projectPath, { targetId: ID, ksFilePath, thresholdDate: beforeDate ? new Date(beforeDate) : undefined });
