#!/usr/bin/env node
import yargs, { ArgumentsCamelCase } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createFrontend } from './features/createFrontend';
import { buildAll }       from './features/buildAll';
import { initProject }    from './features/initProject'; // Importar nueva feature

/**
 * @interface CreateArgs
 * Argumentos esperados para el comando 'create'.
 * Extiende ArgumentsCamelCase de yargs.
 * @property {string} path - La ruta combinada de dominio y feature (ej. 'admin/reports').
 * @property {number} port - El puerto para el servidor de desarrollo del micro-frontend.
 */
interface CreateArgs extends ArgumentsCamelCase {
  path: string;
  port: number;
}

/**
 * @interface InitArgs
 * Argumentos esperados para el comando 'init'. (Actualmente vacío)
 * Extiende ArgumentsCamelCase de yargs.
 */
interface InitArgs extends ArgumentsCamelCase {
  // Podrían añadirse opciones como --skip-install
  'skip-install'?: boolean;
}


yargs(hideBin(process.argv))
  /**
   * Comando para crear un nuevo micro-frontend.
   * Uso: frontforge create <dominio/feature> [--port <numero>]
   * @param {string} path - Ruta combinada dominio/feature. Requerido.
   * @param {number} [port=5173] - Puerto para el servidor de desarrollo. Opcional.
   */
  .command<CreateArgs>(
    'create <path>',
    'Genera un nuevo micro-frontend Preact y los stubs de backend Express asociados.',
    (y) =>
      y
        .positional('path', {
          describe: 'Ruta combinada dominio/feature (ej. admin/reports)',
          type: 'string',
          demandOption: true,
        })
        .option('port', {
          alias: 'p',
          type: 'number',
          describe: 'Puerto para el servidor de desarrollo',
          default: 5173,
        }),
    /**
     * Handler para el comando 'create'.
     * Valida el formato del path, extrae dominio y feature, y llama a createFrontend.
     * @param {CreateArgs} argv - Argumentos parseados por yargs.
     */
    (argv) => {
      const pathParts = argv.path.split('/');
      if (pathParts.length < 2 || pathParts.some(part => !part)) {
        console.error('❌ Formato de path inválido. Se requiere: dominio/feature (ej. admin/reports)');
        process.exit(1);
      }
      const featureName = pathParts.pop()!;
      const domainPath = pathParts.join('/');

      console.log("-> Ejecutando createFrontend con:", { domainPath, featureName, port: argv.port });
      createFrontend(domainPath, featureName, argv);
    }
  )
  /**
   * Comando para compilar todos los micro-frontends existentes.
   * Uso: frontforge build
   */
  .command(
    'build',
    'Compila todos los micro-frontends definidos en config/fronts.json.',
    () => {}, // No necesita builder
    /**
     * Handler para el comando 'build'. Llama a buildAll.
     */
    buildAll
   )
  /**
   * Comando para inicializar una estructura de proyecto backend compatible.
   * Uso: frontforge init [--skip-install]
   */
  .command<InitArgs>( // Añadir comando init
    'init',
    'Inicializa una estructura de proyecto backend Express compatible con frontforge.',
    (y) => // Builder para opciones de init
        y.option('skip-install', {
            type: 'boolean',
            describe: 'Omitir la instalación automática de dependencias npm.',
            default: false,
        }),
    /**
     * Handler para el comando 'init'. Llama a initProject.
     * @param {InitArgs} argv - Argumentos parseados por yargs.
     */
    (argv) => {
        console.log("-> Ejecutando initProject...");
        initProject({ installDeps: !argv['skip-install'] }); // Pasar opción a la función
    }
   )
  .demandCommand(1, 'Debes especificar un comando (init, create o build).') // Actualizar mensaje
  .strict()
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'v')
  .parse();