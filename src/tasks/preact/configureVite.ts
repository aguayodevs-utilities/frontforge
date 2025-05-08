import fs from 'fs';
import path from 'path';

/**
 * @interface ConfigureViteOptions
 * Opciones para la función `configureVite`.
 * @property {string} projectFullPath - Ruta absoluta al directorio del proyecto Preact.
 */
interface ConfigureViteOptions {
  projectFullPath: string;
}

/**
 * Configura el archivo `vite.config.ts` de un proyecto Preact recién creado.
 * Calcula y establece las rutas correctas para `base` y `build.outDir`
 * basándose en la ubicación del proyecto dentro de la estructura esperada (`fronts/` y `public/`).
 *
 * @async
 * @function configureVite
 * @param {ConfigureViteOptions} options - Opciones que incluyen la ruta al proyecto.
 * @returns {Promise<void>} - No devuelve valor, modifica el archivo directamente.
 */
export async function configureVite({ projectFullPath }: ConfigureViteOptions): Promise<void> {
  const viteConfigPath = path.join(projectFullPath, 'vite.config.ts');

  // Verificar si el archivo vite.config.ts existe
  if (!fs.existsSync(viteConfigPath)) {
    console.warn(`⚠️  Archivo no encontrado, omitiendo configuración de Vite: ${viteConfigPath}`);
    return;
  }

  try {
    const repoRoot = process.cwd(); // Raíz del repositorio donde se ejecuta npx

    // Calcular la ruta relativa desde 'fronts/' hasta el proyecto actual
    // ej. 'admin/test/testFrontend'
    const relativePathFromFronts = path.relative(path.join(repoRoot, 'fronts'), projectFullPath)
                                     .split(path.sep).join('/'); // Normalizar a /

    // La base URL pública para los assets (ej. '/admin/test/testFrontend/')
    const publicBasePath = `/${relativePathFromFronts}/`;

    // Calcular la ruta absoluta del directorio de salida (ej. R:\...\repo\public\admin\test\testFrontend)
    const absoluteOutDir = path.join(repoRoot, 'public', relativePathFromFronts);

    // Calcular la ruta relativa desde el directorio del proyecto hasta el directorio de salida
    // ej. '../../../../public/admin/test/testFrontend'
    const relativeOutDir = path.relative(projectFullPath, absoluteOutDir)
                               .split(path.sep).join('/'); // Normalizar a /

    // Leer el contenido de vite.config.ts
    let configContent = fs.readFileSync(viteConfigPath, 'utf8');

    // Reemplazar los placeholders con los valores calculados
    configContent = configContent
      .replace('__BASE_PATH__', publicBasePath) // Reemplaza placeholder para 'base'
      .replace('__OUT_DIR__', relativeOutDir);   // Reemplaza placeholder para 'build.outDir'

    // Escribir el contenido modificado de vuelta al archivo
    fs.writeFileSync(viteConfigPath, configContent);

    console.log(`✅ vite.config.ts configurado para ${relativePathFromFronts}`);

  } catch (error: any) {
    console.error(`❌ Error al configurar ${viteConfigPath}:`, error.message);
    // Considerar relanzar el error si es crítico
    // throw error;
  }
}
