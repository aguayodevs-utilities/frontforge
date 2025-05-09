import path from 'node:path';
import fs from 'fs-extra'; // Necesario para pathExists
import inquirer from 'inquirer'; // Importar inquirer
// Importar tareas desde el nuevo módulo init-express
import { 
  createDirectoryStructure as createExpressDirectoryStructure,
  copyBaseTemplates as copyExpressBaseTemplates,
  ensureRootFiles as ensureExpressRootFiles,
  installDependencies as installExpressDependencies 
} from '../tasks/init-express';

// Importar tareas desde el nuevo módulo init-docker
import {
  generateDockerfile,
  generateDockerCompose,
  copyNginxConfig
} from '../tasks/init-docker';

/**
 * @interface InitProjectOptions
 * Opciones para la función `initProject`.
 * @property {boolean} [installDeps=true] - Si es true, ejecuta `npm install` después de crear los archivos.
 * @property {boolean} [forceInstall=false] - Si es true, fuerza la instalación de dependencias incluso si node_modules existe.
 */
interface InitProjectOptions {
  installDeps?: boolean; 
  forceInstall?: boolean; 
}

const FRAMEWORK_CHOICES = [
  { name: 'Node.js (Express Backend)', value: 'express' },
  { name: 'Docker (Servidor de Estáticos con Nginx)', value: 'docker' },
];

/**
 * Crea el archivo de configuración principal de frontforge.
 * @param projectRoot Ruta raíz del proyecto.
 * @param backendType Tipo de backend seleccionado.
 */
async function createFrontforgeConfig(projectRoot: string, backendType: 'express' | 'docker' | string): Promise<void> {
  const frontforgeDir = path.join(projectRoot, '.frontforge');
  await fs.ensureDir(frontforgeDir);
  const configFilePath = path.join(frontforgeDir, 'config.json');
  const configContent = { backendType };
  
  await fs.writeJson(configFilePath, configContent, { spaces: 2 });
  console.log(`      ✅ Archivo de configuración frontforge creado: ${configFilePath}`);
}

/**
 * Inicializa la estructura base de un proyecto compatible con `frontforge`.
 * Permite al usuario seleccionar el tipo de proyecto (Express o Docker).
 *
 * @async
 * @function initProject
 * @param {InitProjectOptions} options - Opciones para controlar el proceso de inicialización.
 * @returns {Promise<void>} Promesa que se resuelve cuando la inicialización ha finalizado.
 * @throws {Error} Si ocurre un error durante alguna de las tareas críticas.
 */
export async function initProject(options: InitProjectOptions = {}): Promise<void> {
  const { installDeps = true, forceInstall = false } = options; 
  const projectRoot = process.cwd(); 

  console.log('🚀 Bienvenido a la inicialización de proyectos de Frontforge!');

  try {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'frameworkType',
        message: '¿Qué tipo de proyecto deseas inicializar?',
        choices: FRAMEWORK_CHOICES,
      },
    ]);

    // Crear .frontforge/config.json independientemente del tipo, pero después de la selección.
    // La tarea ensureExpressRootFiles también crea .frontforge/, así que esto es un poco redundante
    // pero asegura que config.json se cree con el backendType correcto.
    // Se podría refinar para que ensureExpressRootFiles no cree .frontforge si ya existe.
    // O que createFrontforgeConfig sea llamado por cada flujo específico.
    // Por ahora, lo dejamos así para asegurar que config.json se cree.
    
    if (answers.frameworkType === 'express') {
      console.log(`🚀 Inicializando estructura de backend Node.js (Express) en: ${projectRoot}`);
      
      console.log('\n[Paso 1/5] Creando estructura de directorios y configuración frontforge...');
      await createExpressDirectoryStructure(projectRoot); // Esto crea src, public, etc.
      await createFrontforgeConfig(projectRoot, 'express'); // Crea .frontforge/config.json

      console.log('\n[Paso 2/5] Copiando archivos base desde plantillas...');
      await copyExpressBaseTemplates(projectRoot);

      console.log('\n[Paso 3/5] Creando/Asegurando archivos de configuración raíz...');
      // ensureExpressRootFiles también crea .frontforge/, pero createFrontforgeConfig ya lo hizo y añadió config.json
      await ensureExpressRootFiles(projectRoot); 

      if (installDeps) {
        if (await fs.pathExists(path.join(projectRoot, 'package.json'))) {
          console.log('\n[Paso 4/5] Instalando dependencias...');
          await installExpressDependencies({ projectRoot, forceInstall });
        } else {
          console.warn('\n[Paso 4/5] ⚠️  No se encontró package.json. Omitiendo instalación de dependencias.');
        }
      } else {
        console.log('\n[Paso 4/5] Omitiendo instalación de dependencias (según opción --skip-install). Ejecuta "npm install" manualmente.');
      }
      console.log('\n[Paso 5/5] Finalizando inicialización Express.');
      console.log('\n✨ Proyecto backend Node.js (Express) inicializado exitosamente!');
      console.log(`   Directorio: ${projectRoot}`);
      console.log('   -> Configura tu archivo .env (especialmente JWT_SECRET).');
      console.log('   -> Ejecuta "npm run dev" para iniciar el servidor en modo desarrollo.');
      console.log('   -> Empieza a añadir tus rutas en src/routes/ y controladores/servicios en src/controllers/ y src/services/.');

    } else if (answers.frameworkType === 'docker') {
      console.log(`🐳 Inicializando estructura para Docker (Nginx) en: ${projectRoot}`);
      
      console.log('\n[Paso 1/4] Creando directorio y archivo de configuración frontforge...');
      await createFrontforgeConfig(projectRoot, 'docker'); // Crea .frontforge/config.json
      
      console.log('\n[Paso 2/4] Generando Dockerfile...');
      await generateDockerfile({ projectRoot });
      
      console.log('\n[Paso 3/4] Generando docker-compose.yml...');
      await generateDockerCompose({ projectRoot });

      console.log('\n[Paso 4/4] Copiando configuración de Nginx...');
      await copyNginxConfig({ projectRoot });
            
      console.log('\n✨ Proyecto Docker (Nginx) inicializado exitosamente!');
      console.log(`   Directorio: ${projectRoot}`);
      console.log('   -> Revisa el Dockerfile y docker-compose.yml generados.');
      console.log('   -> Deberás construir y ejecutar los frontends para generar los assets en `public/`.');
      console.log('   -> Luego, construye la imagen Docker: `docker-compose build` o `docker build .`');
      console.log('   -> Ejecuta el contenedor: `docker-compose up`');
      console.log('   -> La configuración de Nginx (`nginx/default.conf`) necesitará ajustes para servir tus SPAs correctamente.');

    } else {
      console.log('Tipo de framework no reconocido o no seleccionado.');
    }

  } catch (error: any) {
    console.error('\n❌ Ocurrió un error durante la inicialización del proyecto:', error.message);
    if (error.isTtyError) {
      console.error('   Inquirer no pudo ejecutarse en este entorno de terminal.');
    }
    process.exit(1);
  }
}