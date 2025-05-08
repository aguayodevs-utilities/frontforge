import path from 'node:path';
import fs from 'fs-extra';
import { templateCopier } from '../../utils/templateCopier'; // Importar utilidad

/**
 * Copia la estructura de archivos base (clases, interfaces, tipos, index.ts)
 * desde el directorio de plantillas `templates/backend-init/src` de `frontforge`
 * al directorio `src` del proyecto destino.
 *
 * @async
 * @function copyBaseTemplates
 * @param {string} projectRoot - La ruta absoluta al directorio raíz del proyecto destino.
 * @returns {Promise<void>} - Promesa que se resuelve cuando la copia ha finalizado.
 * @throws {Error} - Si el directorio de plantillas no se encuentra o si ocurre un error durante la copia.
 */
export async function copyBaseTemplates(projectRoot: string): Promise<void> {
  // Determinar la ruta al directorio de plantillas dentro del paquete frontforge
  // __dirname apunta a .../dist/tasks/init en producción o .../src/tasks/init en desarrollo
  const templateSourceDir = path.join(__dirname, '..', '..', '..', 'templates', 'backend-init', 'src');
  const destinationSrcDir = path.join(projectRoot, 'src');

  // --- DEBUG LOGS ---
  console.log(`   [DEBUG] __dirname: ${__dirname}`);
  console.log(`   [DEBUG] Calculando templateSourceDir: ${templateSourceDir}`);
  // --- FIN DEBUG LOGS ---

  console.log(`   -> Copiando archivos base desde plantillas a ${destinationSrcDir}...`);

  try {
    // Verificar que el directorio de plantillas exista
    if (!await fs.pathExists(templateSourceDir)) {
      // Log adicional para ayudar a depurar
      console.error(`   [DEBUG] Contenido de dist/templates:`);
      try {
          const distTemplatesContent = await fs.readdir(path.join(__dirname, '..', '..', '..', 'templates'));
          console.error(`   [DEBUG] ${distTemplatesContent.join(', ')}`);
          const backendInitContent = await fs.readdir(path.join(__dirname, '..', '..', '..', 'templates', 'backend-init'));
          console.error(`   [DEBUG] Contenido de dist/templates/backend-init: ${backendInitContent.join(', ')}`);
      } catch (readdirError) {
          console.error(`   [DEBUG] No se pudo leer el contenido de dist/templates.`);
      }
      // ---
      throw new Error(`Directorio de plantillas base no encontrado: ${templateSourceDir}`);
    }

    await templateCopier(templateSourceDir, destinationSrcDir);

    console.log('   ✅ Archivos base copiados exitosamente.');

  } catch (error: any) {
    console.error(`   ❌ Error al copiar plantillas base a ${destinationSrcDir}:`, error.message);
    throw error; // Relanzar para detener el proceso principal
  }
}