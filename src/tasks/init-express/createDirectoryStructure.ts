import path from 'node:path';
import fs from 'fs-extra';

/**
 * Lista de directorios base a crear para la estructura del proyecto backend.
 */
const DIRS_TO_CREATE: string[] = [
  'src',
  'src/classes',
  'src/classes/generic',
  'src/classes/http',
  'src/classes/http/error',
  'src/interfaces',
  'src/types',
  // 'config', // Eliminado, ahora se maneja .frontforge/
  'src/routes',
  'public',
  '.frontforge/express' // Asegurar el directorio para los archivos de configuración de
];

/**
 * Crea la estructura de directorios base necesaria para un proyecto backend inicializado.
 * Utiliza `fs-extra.ensureDir` para crear las carpetas de forma idempotente.
 *
 * @async
 * @function createDirectoryStructure
 * @param {string} projectRoot - La ruta absoluta al directorio raíz del proyecto donde se crearán las carpetas.
 * @returns {Promise<void>} - Promesa que se resuelve cuando todas las carpetas han sido aseguradas.
 * @throws {Error} - Si ocurre un error durante la creación de directorios.
 */
export async function createDirectoryStructure(projectRoot: string): Promise<void> {
  console.log('   -> Creando estructura de directorios...');
  try {
    for (const dir of DIRS_TO_CREATE) {
      const dirPath = path.join(projectRoot, dir);
      await fs.ensureDir(dirPath);
      // console.log(`      Ensured: ${dir}`); // Log opcional más detallado
    }

    // Crear archivos de configuración de servicios y controladores
    const servicesConfigPath = path.join(projectRoot, '.frontforge', 'express', 'services.json');
    const controllersConfigPath = path.join(projectRoot, '.frontforge', 'express', 'controllers.json');
    await fs.writeJson(servicesConfigPath, [], { spaces: 2 });
    await fs.writeJson(controllersConfigPath, [], { spaces: 2 });
    console.log('   ✅ Estructura de directorios y archivos de configuración creada/asegurada.');
  } catch (error: any) {
    console.error(`   ❌ Error al crear directorios en ${projectRoot}:`, error.message);
    throw error; // Relanzar para detener el proceso principal
  }
}