import fs from 'fs';
import path from 'path';

/**
 * @interface DeployAssetsOptions
 * Opciones para la función `deployAssets`.
 * @property {string} projectFullPath - Ruta absoluta al directorio del proyecto Preact.
 */
interface DeployAssetsOptions {
  projectFullPath: string;
}

/**
 * Registra la ruta de los assets del micro-frontend recién creado en el archivo
 * de configuración del backend (`src/apps/environment.ts` por defecto).
 *
 * **ADVERTENCIA:** Esta función está **fuertemente acoplada** a la estructura
 * y contenido específicos del archivo `environment.ts` del proyecto backend.
 * Asume la existencia de un array exportado llamado `frontPathAssets` y utiliza
 * una expresión regular para insertar la nueva ruta. Cambios en el formato
 * de `environment.ts` pueden romper esta funcionalidad. Considerar mecanismos
 * de configuración más robustos o descubrimiento dinámico en el futuro.
 *
 * @async
 * @function deployAssets
 * @param {DeployAssetsOptions} options - Opciones que incluyen la ruta al proyecto.
 * @returns {Promise<void>} - No devuelve valor, modifica el archivo del backend directamente.
 */
export async function deployAssets({ projectFullPath }: DeployAssetsOptions): Promise<void> {
  try {
    const repoRoot   = process.cwd(); // Carpeta raíz donde se ejecuta el CLI
    const frontsDir  = path.join(repoRoot, 'fronts');

    // Calcular la sub-ruta relativa desde 'fronts/' (ej. 'admin/test/testFrontend')
    const subPath    = path.relative(frontsDir, projectFullPath).split(path.sep).join('/');
    // Construir la ruta de assets pública esperada (ej. '/admin/test/testFrontend/assets')
    const assetPathToRegister  = `/${subPath}/assets`;

    // Ruta esperada al archivo de configuración del backend
    const backendEnvFilePath = path.join(repoRoot, 'src', 'apps', 'environment.ts');

    // Verificar si el archivo del backend existe
    if (!fs.existsSync(backendEnvFilePath)) {
      console.warn(`⚠️  Archivo de backend no encontrado (${backendEnvFilePath}), omitiendo registro de assets.`);
      return;
    }

    // Leer el contenido del archivo del backend
    let source = fs.readFileSync(backendEnvFilePath, 'utf8');

    // Comprobar si la ruta de assets ya está registrada (evita duplicados)
    // Usar regex para ser un poco más flexible con espacios y comillas
    const assetPathRegex = new RegExp(`["']${assetPathToRegister}["']`);
    if (assetPathRegex.test(source)) {
      console.log(`ℹ️  Ruta de assets '${assetPathToRegister}' ya registrada en ${path.basename(backendEnvFilePath)}.`);
      return;
    }

    // Expresión regular para encontrar el array 'frontPathAssets' y capturar sus partes
    // Captura: (prefijo hasta [ ) (contenido del array) ( ] y sufijo)
    const regex = /(export\s+const\s+frontPathAssets\s*:\s*string\[\]\s*=\s*\[\s*)([^]*?)(\s*\])/m;
    let matchFound = false;

    // Reemplazar el contenido, añadiendo la nueva ruta al final del array
    source = source.replace(regex, (match, prefix, arrayBody, closing) => {
        matchFound = true;
        // Añade la nueva ruta, asegurando una coma si el array no está vacío y formateando
        const separator = arrayBody.trim().endsWith(',') || arrayBody.trim() === '' ? '' : ',';
        const newArrayBody = `${arrayBody.trimEnd()}${separator}\n    "${assetPathToRegister}"`; // Añade con indentación
        return `${prefix}${newArrayBody}${closing}`;
      }
    );

    // Si la regex no encontró el array, mostrar una advertencia
    if (!matchFound) {
        console.warn(`⚠️  No se pudo encontrar el array 'frontPathAssets' en ${backendEnvFilePath}. No se pudo registrar la ruta de assets.`);
        return;
    }

    // Escribir el contenido modificado de vuelta al archivo del backend
    fs.writeFileSync(backendEnvFilePath, source);
    console.log(`✅ Ruta de assets '${assetPathToRegister}' añadida a frontPathAssets en ${path.basename(backendEnvFilePath)}.`);

  } catch (error: any) {
    console.error(`❌ Error durante el registro de assets en el backend:`, error.message);
    // Considerar relanzar el error si es crítico
    // throw error;
  }
};
