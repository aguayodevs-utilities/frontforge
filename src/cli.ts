#!/usr/bin/env node
import yargs, { ArgumentsCamelCase } from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs-extra';
import path from 'node:path';
import { createFrontendPreact } from './features/createFrontend'; // Será renombrado
import { buildAll }       from './features/buildAll';
import { initProject }    from './features/initProject';
import { createController } from './tasks/express/controller';
import { createService } from './tasks/express/service';
import { generateDocs } from './features/generateDocs'; // Importar la nueva función
import { initializeLinting } from './features/initializeLinting'; // Importar la nueva función
 
const CONFIG_DIR_NAME = '.frontforge';
const PROJECT_CONFIG_FILE_NAME = 'config.json';
interface ProjectConfig {
  backendType: 'express' | 'docker' | string;
}

interface CreateArgs extends ArgumentsCamelCase {
  type: 'preact' | 'service' | 'controller'; // Tipos más específicos
  name: string;
  port?: number;
}

/**
 * @interface InitArgs
 * Argumentos esperados para el comando 'init'. (Actualmente vacío)
 * Extiende ArgumentsCamelCase de yargs.
 */
interface InitArgs extends ArgumentsCamelCase {
  'skip-install'?: boolean;
  'with-logger'?: boolean; // Añadir opción para logger
}


yargs(hideBin(process.argv))
  .command<CreateArgs>(
    'create <type> <name>',
    'Crea un nuevo artefacto (frontend Preact, servicio Express, controlador Express).',
    (y) =>
      y
        .positional('type', {
          describe: "Tipo de artefacto a crear ('preact', 'service', 'controller')",
          type: 'string',
          choices: ['preact', 'service', 'controller'] as const, // Asegurar tipos
          demandOption: true,
        })
        .positional('name', {
          describe: "Nombre/ruta del artefacto (ej. 'admin/reports' para preact, 'users/auth' para service/controller)",
          type: 'string',
          demandOption: true,
        })
        .option('port', {
          alias: 'p',
          type: 'number',
          describe: 'Puerto para el servidor de desarrollo (solo para type=\'preact\')',
        }),
    async (argv) => {
      const { type, name } = argv;
      const port = argv.port;

      const nameParts = name.split('/');
      if (nameParts.length < 1 || nameParts.some(part => !part)) { // Permitir un solo segmento para nombres simples si el dominio es la raíz
        console.error(`❌ Formato de nombre/ruta inválido para '${name}'. Se requiere: [dominio/]/nombre (ej. admin/reports o solo reports).`);
        process.exit(1);
      }
      
      const featureName = nameParts.pop()!;
      const domainPath = nameParts.join('/') || '.'; // Usar '.' si no hay dominio explícito

      const repoRoot = process.cwd();
      const projectConfigPath = path.join(repoRoot, CONFIG_DIR_NAME, PROJECT_CONFIG_FILE_NAME);
      let projectConfig: ProjectConfig = { backendType: 'unknown' };

      try {
        if (await fs.pathExists(projectConfigPath)) {
          projectConfig = await fs.readJson(projectConfigPath) as ProjectConfig;
        } else {
          console.warn(`⚠️  Archivo de configuración del proyecto (${projectConfigPath}) no encontrado. Para 'service' o 'controller', se asumirá que no es Express si no se encuentra.`);
        }
      } catch (error: any) {
        console.warn(`⚠️  Error al leer ${PROJECT_CONFIG_FILE_NAME}: ${error.message}.`);
      }

      if (type === 'preact') {
        const finalPort = port || 5173;
        console.log("-> Ejecutando createFrontendPreact con:", { domainPath, featureName, port: finalPort, type });
        await createFrontendPreact(domainPath, featureName, { ...argv, port: finalPort });
      } else if (type === 'service') {
        if (projectConfig.backendType === 'express') {
          console.log("-> Ejecutando createService para Express con:", { domainPath, featureName, type });
          await createService({ domain: domainPath, feature: featureName });
        } else {
          console.error(`❌ No se puede crear un servicio. El tipo de backend del proyecto no es 'express' (actual: ${projectConfig.backendType}).`);
          console.log(`   Asegúrate de haber ejecutado 'frontforge init' y seleccionado 'Node.js (Express Backend)' o que tu .frontforge/config.json lo refleje.`);
          process.exit(1);
        }
      } else if (type === 'controller') {
        if (projectConfig.backendType === 'express') {
          console.log("-> Ejecutando createController para Express con:", { domainPath, featureName, type });
          await createController({ domain: domainPath, feature: featureName });
        } else {
          console.error(`❌ No se puede crear un controlador. El tipo de backend del proyecto no es 'express' (actual: ${projectConfig.backendType}).`);
          console.log(`   Asegúrate de haber ejecutado 'frontforge init' y seleccionado 'Node.js (Express Backend)' o que tu .frontforge/config.json lo refleje.`);
          process.exit(1);
        }
      }
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
   * Comando para generar documentación Swagger/OpenAPI.
   * Uso: frontforge doc
   */
  .command(
    'doc',
    'Genera la documentación Swagger/OpenAPI para el proyecto backend Express.',
    () => {}, // No necesita builder por ahora
    /**
     * Handler para el comando 'doc'. Llama a generateDocs.
     */
    generateDocs
   )
  /**
   * Comando para inicializar configuración de Linting, Prettier y Husky.
   * Uso: frontforge lint:init
   */
  .command(
    'lint:init',
    'Inicializa la configuración de ESLint, Prettier y Husky para el proyecto.',
    () => {}, // No necesita builder por ahora
    /**
     * Handler para el comando 'lint:init'. Llama a initializeLinting.
     */
    initializeLinting
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
        })
        .option('with-logger', { // Añadir opción --with-logger
            type: 'boolean',
            describe: 'Incluir middleware de logging estructurado (Pino).',
            default: false,
        }),
    /**
     * Handler para el comando 'init'. Llama a initProject.
     * @param {InitArgs} argv - Argumentos parseados por yargs.
     */
    (argv) => {
        console.log("-> Ejecutando initProject...");
        initProject({
          installDeps: !argv['skip-install'],
          withLogger: argv['with-logger'] // Pasar opción withLogger
        });
    }
   )
.demandCommand(1, 'Debes especificar un comando (init, create, build, doc o lint:init).') // Actualizar mensaje
.strict()
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'v')
  .parse();