/*
 * @copyright Microsoft Corporation. All rights reserved.
 */
import yargs from 'yargs/yargs';

const argv = yargs(process.argv.slice(2))
  .command(
    '$0 <ID>',
    'KS Killer yo',
    (yargs) => {
      yargs
        .positional('ID', {
          describe: 'ID of the KS to graduate',
          type: 'string'
        })
        .options({
          projectDirectory: { type: 'string', default: process.cwd() },
          ksFilePath: { type: 'string' }
        });
    },
    ({ ID: id }) => console.log(id)
  )
  .help().argv;
