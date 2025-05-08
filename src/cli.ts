#!/usr/bin/env node
import yargs, { ArgumentsCamelCase } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createFrontend } from './features/createFrontend';
import { buildAll }       from './features/buildAll';

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

yargs(hideBin(process.argv))
  /**
   * Comando para crear un nuevo micro-frontend.
   * Uso: frontforge create <dominio/feature> [--port <numero>]
   * @param {string} path - Ruta combinada dominio/feature. Requerido.
   * @param {number} [port=5173] - Puerto para el servidor de desarrollo. Opcional.
   */
  .command<CreateArgs>(
    'create <path>', // Se elimina [port] ya que se define como opción
    'Genera un nuevo micro-frontend Preact y los stubs de backend Express asociados.',
    (y) =>
      y
        .positional('path', {
          describe: 'Ruta combinada dominio/feature (ej. admin/reports)',
          type: 'string',
          demandOption: true, // Asegura que 'path' sea obligatorio
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
      // Validar y extraer dominio/feature del path
      const pathParts = argv.path.split('/');
      if (pathParts.length < 2 || pathParts.some(part => !part)) { // Verifica partes vacías también
        console.error('❌ Formato de path inválido. Se requiere: dominio/feature (ej. admin/reports)');
        process.exit(1); // Termina si el formato es incorrecto
      }
      const featureName = pathParts.pop()!; // Extrae el último elemento como feature
      const domainPath = pathParts.join('/'); // Une el resto como dominio

      console.log("-> Ejecutando createFrontend con:", { domainPath, featureName, port: argv.port });
      // Llama a la función principal para crear el frontend
      createFrontend(domainPath, featureName, argv);
    }
  )
  /**
   * Comando para compilar todos los micro-frontends existentes.
   * Uso: frontforge build
   */
  .command(
    'build',
    'Compila todos los micro-frontends definidos en fronts.json.',
    () => {}, // No necesita builder
    /**
     * Handler para el comando 'build'. Llama a buildAll.
     */
    buildAll // Llama directamente a la función importada
   )
  .demandCommand(1, 'Debes especificar un comando (create o build).') // Exige al menos un comando
  .strict() // Falla con opciones desconocidas
  .help() // Habilita la ayuda automática (--help)
  .alias('help', 'h') // Alias para help
  .version() // Habilita la versión automática (--version)
  .alias('version', 'v') // Alias para version
  .parse(); // Parsea los argumentos