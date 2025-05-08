#!/usr/bin/env node
import yargs, { ArgumentsCamelCase } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createFrontend } from './features/createFrontend';
import { buildAll }       from './features/buildAll';

interface CreateArgs extends ArgumentsCamelCase {
  path: string;
  port: number;
}

yargs(hideBin(process.argv))
  .command<CreateArgs>(
    'create <path> [port]',
    'Genera micro-frontend',
    (y) =>
      y
        .positional('path', {
          describe: 'dominio/feature (ej. admin/reports)',
          type: 'string',
          demandOption: true
        })
        .option('port', { alias: 'p', type: 'number', default: 5173 }),
    (argv) => {
      const parts = argv.path.split('/');
      if (parts.length < 2) {
        console.error('❌  Formato requerido: dominio/feature (ej. admin/reports)');
        process.exit(1);
      }
      const featureName = parts.pop()!;
      const domainPath = parts.join('/');
      console.log("createFrontend With:", {domainPath, featureName, argv});
      createFrontend(domainPath, featureName, argv);
    }
  )
  .command('build', 'Compila todos', () => {}, buildAll)
  .demandCommand(1)
  .strict()
  .help()
  .parse();