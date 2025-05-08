import fs from 'fs';
import path from 'path';

/**
 * @interface UpdateIndexFileOptions
 * Opciones para la función `updateIndexFile`.
 * @property {string} projectFullPath - Ruta absoluta al directorio del proyecto Preact.
 */
interface UpdateIndexFileOptions {
  projectFullPath: string;
}

/**
 * Intenta insertar el componente de prueba `<TestComponent />` en el archivo `src/index.tsx`
 * del proyecto Preact.
 *
 * **NOTA DE OBSOLESCENCIA:** Esta tarea parece ser **obsoleta** en el flujo actual de `createFrontend`.
 * La tarea `templateCopier` sobrescribe `src/index.tsx` con una versión de plantilla que
 * *ya incluye* `TestComponent` antes de que esta función se ejecute. Como resultado,
 * la condición `!content.includes('TestComponent')` probablemente siempre será falsa,
 * y esta función no realizará ninguna modificación. Considerar eliminar esta tarea
 * del flujo de `createFrontend`.
 *
 * La lógica original intentaba modificar el `index.tsx` generado por `create-preact`
 * si no era sobrescrito por una plantilla.
 *
 * @async
 * @function updateIndexFile
 * @param {UpdateIndexFileOptions} options - Opciones que incluyen la ruta al proyecto.
 * @returns {Promise<void>} - No devuelve valor, modifica el archivo si se cumplen las condiciones (obsoletas).
 */
export async function updateIndexFile({ projectFullPath }: UpdateIndexFileOptions): Promise<void> {
  const indexFilePath = path.join(projectFullPath, 'src', 'index.tsx');

  // Verificar si el archivo index.tsx existe
  if (!fs.existsSync(indexFilePath)) {
    console.warn(`⚠️  Archivo no encontrado, omitiendo actualización de index.tsx: ${indexFilePath}`);
    return;
  }

  try {
    // Leer el contenido del archivo
    let content = fs.readFileSync(indexFilePath, 'utf8');

    // Comprobar si el componente de prueba ya está presente (probablemente sí, debido a templateCopier)
    if (!content.includes('TestComponent')) {
      // Esta lógica probablemente ya no se ejecute
      console.log(`ℹ️  Intentando insertar TestComponent en ${path.basename(indexFilePath)} (lógica obsoleta)...`);
      // Reemplazar antes de la etiqueta de cierre </main> (muy frágil)
      const insertionPoint = '</main>';
      if (content.includes(insertionPoint)) {
        content = content.replace(insertionPoint, `      <TestComponent />\n    ${insertionPoint}`);
        fs.writeFileSync(indexFilePath, content);
        console.log(`✅ (Obsoleto) index.tsx enriquecido con TestComponent.`);
      } else {
        console.warn(`⚠️  (Obsoleto) No se encontró el punto de inserción '${insertionPoint}' en ${path.basename(indexFilePath)}.`);
      }
    } else {
      console.log(`ℹ️  TestComponent ya presente en ${path.basename(indexFilePath)} (probablemente por plantilla). No se requiere actualización.`);
    }
  } catch (error: any) {
    console.error(`❌ Error al actualizar ${indexFilePath}:`, error.message);
    // Considerar relanzar el error si es crítico
    // throw error;
  }
};