/**
 * Añade automáticamente el nuevo path de assets al arreglo `frontPathAssets`
 * del backend `check-ai-apiux/src/apps/environment.ts`.
 *
 * • Calcula la sub‑ruta que ya se usó para base/outDir en vite.config.ts
 *   (ej.: admin/my-apps/create-app)
 * • Prepara "/<sub‑ruta>/assets"
 * • Inserta si aún no existe en el array.
 */
import fs from 'fs';
import path from 'path';

export async function deployAssets({ projectFullPath }: { projectFullPath: string }) {
  const repoRoot   = process.cwd(); // carpeta raíz donde ejecutas el CLI
  const frontsDir  = path.join(repoRoot, 'fronts');
  const subPath    = path
    .relative(frontsDir, projectFullPath)   // admin/my-apps/create-app
    .split(path.sep).join('/');             // normaliza a POSIX
  const assetPath  = `/${subPath}/assets`;   // /admin/my-apps/create-app/assets

  // Ruta al archivo del backend
  const envFile = path.join(
    repoRoot,
    'src',
    'apps',
    'environment.ts',
  );

  if (!fs.existsSync(envFile)) {
    console.warn('⚠️  environment.ts no encontrado, omitiendo deployAssets');
    return;
  }

  let source = fs.readFileSync(envFile, 'utf8');

  // Comprueba si ya existe
  if (source.includes(`"${assetPath}"`)) {
    console.log(`ℹ️  ${assetPath} ya estaba registrado en frontPathAssets`);
    return;
  }

  // Inserta antes del corchete de cierre del array frontPathAssets
  source = source.replace(
    /(export const frontPathAssets:\s*[^\[]*\[\s*)([^]*?)(\s*\])/m,
    (match, prefix, arrayBody, closing) =>
      `${prefix}${arrayBody.trimEnd()},\n    "${assetPath}"${closing}`,
  );

  fs.writeFileSync(envFile, source);
  console.log(`✅  Añadido ${assetPath} a frontPathAssets`);
};
