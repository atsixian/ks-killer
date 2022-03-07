/*
 * @copyright Microsoft Corporation. All rights reserved.
 */
import yargs from 'yargs/yargs';
import { validate as uuidValidate } from 'uuid';
import { run } from '.';

interface IArguments {
  ID: string;
  beforeDate: string;
  projectPath: string;
  ksFilePath: string;
}

const argv: IArguments = yargs(process.argv.slice(2))
  .usage('ks-killer [options...]')
  .showHelpOnFail(true)
  .option('ID', {
    alias: ['id'],
    describe: 'ID of the KS to graduate',
    type: 'string'
  })
  .option('beforeDate', {
    alias: ['before-date'],
    type: 'string',
    describe: 'Graduate ks before the specific date. MM/DD/YYYY'
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
    if ((argv.ID || argv.beforeDate)) {
      if (argv.ID && !uuidValidate(argv.ID)) {
        throw (new Error('Error: please provide a valid ks-ID (uuid)'));
      }
      if (argv.beforeDate && isNaN(new Date(argv.beforeDate).getTime())) {
        throw (new Error('Error: please provide a valid date (MM/DD/YYYY)'));
      }
      return true;
    } else if (/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(argv['_'][0]?.toString())) {
      argv.ID = argv['_'][0]?.toString();
      return true;
    } else {
      throw (new Error('Error: please provide either ksid(--id) or date(--before-date)'));
    }
  })
  .help().argv;

const { ID, projectPath, ksFilePath, beforeDate } = argv;

run(projectPath, { targetId: ID, ksFilePath, thresholdDate: new Date(beforeDate) })
