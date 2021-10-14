/*
 * @copyright Microsoft Corporation. All rights reserved.
 */
import yargs from 'yargs/yargs';

const argv = yargs(process.argv.slice(2))
  .command(
    '$0',
    'KS Killer yo',
    (yargs) => {
      yargs.options({
        projectDirectory: { type: 'string', default: process.cwd() },
        ksFilePath: { type: 'string' }
      });
    },
    () => {
      console.log('hi');
    }
  )
  .help().argv;
