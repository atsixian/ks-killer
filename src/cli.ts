/*
 * @copyright Microsoft Corporation. All rights reserved.
 */
import yargs from 'yargs/yargs';

const argv = yargs(process.argv.slice(2))
  .usage('ks-killer <KS ID> [options...]')
  .showHelpOnFail(true, 'Please provide a KS ID')
  .command(
    '$0 <ID>',
    'KS Killer',
    (yargs) => {
      yargs
        .positional('ID', {
          describe: 'ID of the KS to graduate',
          type: 'string'
        })
        .option('project-path', {
          alias: 'p',
          type: 'string',
          describe: 'Target project to clean. Default to cwd.',
          default: process.cwd()
        })
        .option('ks-file-path', {
          alias: 'k',
          type: 'string',
          describe: 'The file path of the KS. This boosts performance.'
        });
    },
    ({ ID: id, projectPath, ksFilePath }) => console.log(id, projectPath, ksFilePath)
  )
  .help().argv;
