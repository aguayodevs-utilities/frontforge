import fs from 'fs';
import path from 'path';

/**
 * @interface UpdateStylesFileOptions
 * Opciones para la función `updateStylesFile`.
 * @property {string} projectFullPath - Ruta absoluta al directorio del proyecto Preact.
 */
interface UpdateStylesFileOptions {
  projectFullPath: string;
}

/**
 * Sobrescribe el archivo `src/style.css` del proyecto Preact con un conjunto
 * mínimo de estilos base.
 * Define la fuente principal y estilos básicos para enlaces utilizando variables CSS
 * (que se espera estén definidas en otro lugar, como en el paquete compartido).
 *
 * @async
 * @function updateStylesFile
 * @param {UpdateStylesFileOptions} options - Opciones que incluyen la ruta al proyecto.
 * @returns {Promise<void>} - No devuelve valor, modifica el archivo directamente.
 */
export async function updateStylesFile({ projectFullPath }: UpdateStylesFileOptions): Promise<void> {
  const cssFilePath = path.join(projectFullPath, 'src', 'style.css');

  // Contenido CSS base para sobrescribir el archivo
  // Utiliza variables CSS que deben estar definidas globalmente (ej. desde preact-shared)
  const baseCssContent = `:root {
  /* Define la fuente base para la aplicación */
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
}

a {
  /* Estilo base para enlaces */
  color: var(--app-color-secondary, #007bff); /* Usa variable o fallback */
  text-decoration: none; /* Opcional: quitar subrayado */
}

a:hover {
  /* Estilo para enlaces al pasar el mouse */
  color: var(--app-color-primary, #0056b3); /* Usa variable o fallback */
  text-decoration: underline; /* Opcional: añadir subrayado al hover */
}
`; // Añadido punto y coma y formato

  try {
    // Sobrescribir el archivo style.css con el contenido base
    // Nota: Esto eliminará cualquier contenido previo en style.css
    fs.writeFileSync(cssFilePath, baseCssContent);
    console.log(`✅ Archivo ${path.basename(cssFilePath)} establecido con estilos base.`);
  } catch (error: any) {
    console.error(`❌ Error al escribir en ${cssFilePath}:`, error.message);
    // Considerar relanzar el error si es crítico
    // throw error;
  }
};