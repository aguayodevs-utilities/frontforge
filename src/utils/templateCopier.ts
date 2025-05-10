import fs from 'fs-extra'; // Usar fs-extra para operaciones de sistema de archivos robustas
import path from 'node:path'; // No usado directamente, pero útil para contexto

/**
 * Copia de forma recursiva todo el contenido de un directorio de plantillas
 * de origen a un directorio de destino, conservando la estructura de carpetas.
 * Es útil para copiar esqueletos de proyectos o conjuntos de archivos base.
 *
 * @async
 * @function templateCopier
 * @param {string} srcRoot - Ruta absoluta al directorio de plantillas de origen.
 * @param {string} destRoot - Ruta absoluta al directorio de destino donde se copiarán las plantillas.
 *                            Se creará si no existe. `fs.copy` sobrescribirá archivos existentes en el destino.
 * @returns {Promise<void>} - Promesa que se resuelve cuando la copia ha finalizado.
 * @throws {Error} - Si ocurre un error durante la verificación de existencia o la copia (y no es manejado internamente).
 */
export async function templateCopier(srcRoot: string, destRoot: string): Promise<void> {
  console.log(`✨ Copiando plantillas desde: ${srcRoot} -> ${destRoot}`);

  try {
    // Verificar si el directorio de origen existe antes de intentar copiar
    if (!(await fs.pathExists(srcRoot))) {
      // Es importante advertir si la fuente no existe, ya que es un error esperado en algunos flujos si la ruta es incorrecta
      console.warn(`⚠️  Directorio de plantillas de origen no encontrado, omitiendo copia: ${srcRoot}`);
      // Dependiendo del caso de uso, podría ser mejor lanzar un error aquí:
      // throw new Error(`Directorio de plantillas de origen no encontrado: ${srcRoot}`);
      return; // Terminar si la fuente no existe
    }

    // Listar contenido del directorio de origen para depuración
    try {
      const sourceContents = await fs.readdir(srcRoot);
      console.log(`[templateCopier] Contenido de ${srcRoot}:`, sourceContents);
      if (sourceContents.length === 0) {
        console.warn(`[templateCopier] ADVERTENCIA: El directorio de origen ${srcRoot} está vacío.`);
      }
    } catch (readdirError: any) {
      console.error(`[templateCopier] Error al leer el contenido de ${srcRoot}:`, readdirError.message);
      // Decidir si continuar o lanzar error aquí también
    }

    // Realizar la copia recursiva. fs.copy maneja la creación del directorio destino si no existe.
    // Por defecto, sobrescribe archivos existentes en el destino.
    // Se podrían añadir opciones a fs.copy si se necesita un comportamiento diferente (ej. { overwrite: false, errorOnExist: true })
    await fs.copy(srcRoot, destRoot);

    console.log(`📄 Plantillas copiadas exitosamente a: ${destRoot}`);

  } catch (error: any) {
    console.error(`❌ Error durante la copia de plantillas desde ${srcRoot} a ${destRoot}:`, error.message);
    // Relanzar el error para que el proceso principal falle si la copia es crítica
    throw error;
  }
}
