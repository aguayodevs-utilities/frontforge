import path from 'node:path';
import fs from 'fs-extra'; // Necesario para pathExists
import { createDirectoryStructure } from '../tasks/init/createDirectoryStructure';
import { copyBaseTemplates } from '../tasks/init/copyBaseTemplates';
import { ensureRootFiles } from '../tasks/init/ensureRootFiles';
import { installDependencies } from '../tasks/init/installDependencies';

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

/**
 * Inicializa la estructura base de un proyecto backend Express compatible con `frontforge`.
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
  const projectRoot = process.cwd(); // Asume que se ejecuta en la raíz del nuevo proyecto backend

  console.log(`🚀 Inicializando estructura de backend en: ${projectRoot}`);

  try {
    // --- 1. Crear Estructura de Carpetas ---
    console.log('\n[Paso 1/4] Creando estructura de directorios...');
    await createDirectoryStructure(projectRoot);

    // --- 2. Copiar Archivos Base desde Plantillas ---
    console.log('\n[Paso 2/4] Copiando archivos base desde plantillas...');
    await copyBaseTemplates(projectRoot);

    // --- 3. Asegurar Archivos de Configuración Raíz ---
    console.log('\n[Paso 3/4] Creando/Asegurando archivos de configuración raíz...');
    await ensureRootFiles(projectRoot);

    // --- 4. Instalar Dependencias ---
    if (installDeps) {
      // Verificar si package.json existe antes de intentar instalar
      if (await fs.pathExists(path.join(projectRoot, 'package.json'))) {
        console.log('\n[Paso 4/4] Instalando dependencias...');
        await installDependencies({ projectRoot, forceInstall });
      } else {
        console.warn('\n[Paso 4/4] ⚠️  No se encontró package.json. Omitiendo instalación de dependencias.');
      }
    } else {
      console.log('\n[Paso 4/4] Omitiendo instalación de dependencias (según opción --skip-install). Ejecuta "npm install" manualmente.');
    }

    // --- Finalización ---
    console.log('\n✨ Proyecto backend inicializado exitosamente!');
    console.log(`   Directorio: ${projectRoot}`);
    console.log('   -> Configura tu archivo .env (especialmente JWT_SECRET).');
    console.log('   -> Ejecuta "npm run dev" para iniciar el servidor en modo desarrollo.');
    console.log('   -> Empieza a añadir tus rutas en src/routes/ y controladores/servicios en src/controllers/ y src/services/.');

  } catch (error: any) {
    console.error('\n❌ Ocurrió un error durante la inicialización del proyecto:', error.message);
    // Considerar loguear error.stack para más detalles en depuración
    // console.error(error.stack);
    process.exit(1); // Terminar el proceso en caso de error crítico
  }
}