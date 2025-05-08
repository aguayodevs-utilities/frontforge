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

  console.log(`   -> Copiando archivos base desde plantillas a ${destinationSrcDir}...`);

  try {
    // Verificar que el directorio de plantillas exista
    if (!await fs.pathExists(templateSourceDir)) {
      throw new Error(`Directorio de plantillas base no encontrado: ${templateSourceDir}`);
    }

    // Usar templateCopier para copiar el contenido de la carpeta 'src' de las plantillas
    // a la carpeta 'src' del proyecto destino.
    // templateCopier (fs.copy) por defecto no sobrescribe si el destino existe,
    // pero sí copia el contenido *dentro* del directorio si ya existe.
    // Si queremos asegurar que los archivos base siempre sean los de la plantilla,
    // podríamos necesitar eliminar el directorio 'src' destino antes o usar { overwrite: true }
    // Por ahora, asumimos que si 'src' existe, queremos añadir/mezclar los archivos base.
    await templateCopier(templateSourceDir, destinationSrcDir);

    console.log('   ✅ Archivos base copiados exitosamente.');

  } catch (error: any) {
    console.error(`   ❌ Error al copiar plantillas base a ${destinationSrcDir}:`, error.message);
    throw error; // Relanzar para detener el proceso principal
  }
}