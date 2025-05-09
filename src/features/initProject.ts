import path from 'node:path';
import fs from 'fs-extra'; // Necesario para pathExists
import inquirer from 'inquirer'; // Importar inquirer
// Importar tareas desde el nuevo módulo init-express
import { 
  createDirectoryStructure,
  copyBaseTemplates,
  ensureRootFiles,
  installDependencies 
} from '../tasks/init-express';

/**
 * @interface InitProjectOptions
 * Opciones para la función `initProject`.
 * @property {boolean} [installDeps=true] - Si es true, ejecuta `npm install` después de crear los archivos.
 * @property {boolean} [forceInstall=false] - Si es true, fuerza la instalación de dependencias incluso si node_modules existe.
 */
interface InitProjectOptions {
  installDeps?: boolean;
  forceInstall?: boolean; // Añadida opción para forzar instalación
}

const FRAMEWORK_CHOICES = [
  { name: 'Node.js (Express Backend)', value: 'express' },
  // { name: 'Docker (Servidor de Estáticos con Nginx)', value: 'docker' }, // Se añadirá en Fase 2
];

/**
 * Inicializa la estructura base de un proyecto backend compatible con `frontforge`.
 * Orquesta una serie de tareas: crear carpetas, copiar plantillas base, asegurar archivos raíz
 * e instalar dependencias.
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

    if (answers.frameworkType === 'express') {
      console.log(`🚀 Inicializando estructura de backend Node.js (Express) en: ${projectRoot}`);
      
      // --- Lógica actual para Express ---
      console.log('\n[Paso 1/4] Creando estructura de directorios...');
      await createDirectoryStructure(projectRoot);

      console.log('\n[Paso 2/4] Copiando archivos base desde plantillas...');
      await copyBaseTemplates(projectRoot);

      console.log('\n[Paso 3/4] Creando/Asegurando archivos de configuración raíz...');
      await ensureRootFiles(projectRoot);

      if (installDeps) {
        if (await fs.pathExists(path.join(projectRoot, 'package.json'))) {
          console.log('\n[Paso 4/4] Instalando dependencias...');
          await installDependencies({ projectRoot, forceInstall });
        } else {
          console.warn('\n[Paso 4/4] ⚠️  No se encontró package.json. Omitiendo instalación de dependencias.');
        }
      } else {
        console.log('\n[Paso 4/4] Omitiendo instalación de dependencias (según opción --skip-install). Ejecuta "npm install" manualmente.');
      }
      // --- Fin de lógica para Express ---

      console.log('\n✨ Proyecto backend Node.js (Express) inicializado exitosamente!');
      console.log(`   Directorio: ${projectRoot}`);
      console.log('   -> Configura tu archivo .env (especialmente JWT_SECRET).');
      console.log('   -> Ejecuta "npm run dev" para iniciar el servidor en modo desarrollo.');
      console.log('   -> Empieza a añadir tus rutas en src/routes/ y controladores/servicios en src/controllers/ y src/services/.');

    } else if (answers.frameworkType === 'docker') {
      // Lógica para Docker se implementará en Fase 2
      console.log(`🛠️  Inicialización de Docker seleccionada. Esta funcionalidad se implementará en una fase futura.`);
      console.log('   Por favor, selecciona "Node.js (Express Backend)" por ahora.');
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