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
  installDeps?: boolean; // installDeps no se usará directamente para Docker init, pero se mantiene por consistencia
  forceInstall?: boolean; 
}

const FRAMEWORK_CHOICES = [
  { name: 'Node.js (Express Backend)', value: 'express' },
  { name: 'Docker (Servidor de Estáticos con Nginx)', value: 'docker' },
];

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
  const { installDeps = true, forceInstall = false } = options; // installDeps y forceInstall son más relevantes para Express
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

    if (answers.frameworkType === 'express') {
      console.log(`🚀 Inicializando estructura de backend Node.js (Express) en: ${projectRoot}`);
      
      console.log('\n[Paso 1/4] Creando estructura de directorios...');
      await createExpressDirectoryStructure(projectRoot);

      console.log('\n[Paso 2/4] Copiando archivos base desde plantillas...');
      await copyExpressBaseTemplates(projectRoot);

      console.log('\n[Paso 3/4] Creando/Asegurando archivos de configuración raíz...');
      await ensureExpressRootFiles(projectRoot);

      if (installDeps) {
        if (await fs.pathExists(path.join(projectRoot, 'package.json'))) {
          console.log('\n[Paso 4/4] Instalando dependencias...');
          await installExpressDependencies({ projectRoot, forceInstall });
        } else {
          console.warn('\n[Paso 4/4] ⚠️  No se encontró package.json. Omitiendo instalación de dependencias.');
        }
      } else {
        console.log('\n[Paso 4/4] Omitiendo instalación de dependencias (según opción --skip-install). Ejecuta "npm install" manualmente.');
      }

      console.log('\n✨ Proyecto backend Node.js (Express) inicializado exitosamente!');
      console.log(`   Directorio: ${projectRoot}`);
      console.log('   -> Configura tu archivo .env (especialmente JWT_SECRET).');
      console.log('   -> Ejecuta "npm run dev" para iniciar el servidor en modo desarrollo.');
      console.log('   -> Empieza a añadir tus rutas en src/routes/ y controladores/servicios en src/controllers/ y src/services/.');

    } else if (answers.frameworkType === 'docker') {
      console.log(`🐳 Inicializando estructura para Docker (Nginx) en: ${projectRoot}`);
      
      console.log('\n[Paso 1/3] Generando Dockerfile...');
      await generateDockerfile({ projectRoot });
      
      console.log('\n[Paso 2/3] Generando docker-compose.yml...');
      await generateDockerCompose({ projectRoot });

      console.log('\n[Paso 3/3] Copiando configuración de Nginx...');
      await copyNginxConfig({ projectRoot });
      
      // Para Docker, no hay 'npm install' a nivel raíz del proyecto por defecto.
      // Las dependencias se manejan dentro de la imagen o por los servicios individuales.
      
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