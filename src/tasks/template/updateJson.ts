import fs from 'fs-extra'; // Usar fs-extra para manejo robusto de archivos JSON

/**
 * Actualiza un archivo JSON que contiene un array de objetos.
 * Lee el archivo, busca un objeto existente basado en una clave única y lo reemplaza
 * con la nueva entrada proporcionada. Si no se encuentra ningún objeto coincidente,
 * añade la nueva entrada al array. Finalmente, escribe el array actualizado
 * de vuelta al archivo JSON con formato indentado.
 *
 * @async
 * @template T - El tipo de los objetos contenidos en el array JSON. Debe ser un objeto con claves de string.
 * @function updateJson
 * @param {string} file - Ruta absoluta al archivo JSON a actualizar. Se creará si no existe.
 * @param {keyof T} uniqueKey - La clave (nombre de propiedad) del objeto `T` que se usará para identificar entradas únicas.
 * @param {T} entry - El nuevo objeto (o el objeto actualizado) que se debe añadir o usar para reemplazar en el array.
 * @returns {Promise<void>} - Promesa que se resuelve cuando el archivo ha sido escrito.
 * @throws {Error} - Si ocurre un error durante la lectura o escritura del archivo JSON (excepto si el archivo no existe o está vacío/inválido al leer, en cuyo caso se crea/sobrescribe).
 */
export async function updateJson<T extends { [k: string]: any }>(
  file: string,
  uniqueKey: keyof T,
  entry: T
): Promise<void> {
  let arr: T[] = [];
  try {
    // Asegurar que el archivo (y su directorio) exista antes de leerlo
    await fs.ensureFile(file);
    // Leer y parsear el JSON. Devolver array vacío si falla (ej. vacío, inválido)
    arr = await fs.readJson(file).catch(() => {
        console.warn(`⚠️  Archivo JSON vacío o inválido en ${file}. Se creará/sobrescribirá.`);
        return [];
    });
    // Asegurarse de que lo leído (o el fallback) sea un array
    if (!Array.isArray(arr)) {
        console.warn(`⚠️  El contenido de ${file} no es un array. Se sobrescribirá.`);
        arr = [];
    }
  } catch (readError: any) {
      console.error(`❌ Error inesperado al asegurar o leer ${file}:`, readError.message);
      // Decidir si continuar con un array vacío o relanzar el error
      // Por ahora, continuamos para intentar escribir un nuevo archivo.
      arr = [];
  }

  // Buscar el índice de la entrada existente usando la clave única
  const idx = arr.findIndex((e) => e && typeof e === 'object' && e[uniqueKey] === entry[uniqueKey]);

  if (idx >= 0) {
    // Reemplazar la entrada existente
    arr[idx] = entry;
  } else {
    // Añadir la nueva entrada si no se encontró
    arr.push(entry);
  }

  try {
    // Escribir el array actualizado de vuelta al archivo JSON con indentación
    await fs.writeJson(file, arr, { spaces: 2 });
  } catch (writeError: any) {
      console.error(`❌ Error al escribir en ${file}:`, writeError.message);
      throw writeError; // Relanzar error de escritura
  }
}
