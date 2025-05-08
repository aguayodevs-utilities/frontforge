import fs from 'fs-extra';
import path from 'node:path';

/**
 * Copia todo el contenido de `srcRoot` dentro de `destRoot`
 * conservando la jerarquía de carpetas.
 */
export async function templateCopier(srcRoot: string, destRoot: string) {
  console.log('✨ templateCopier desde:', srcRoot, '->', destRoot);
  if (!(await fs.pathExists(srcRoot))) {
    console.warn('⚠️  templateCopier: no existe', srcRoot);
    return;
  }
  await fs.copy(srcRoot, destRoot);
  console.log('📄 Plantilla copiada de', srcRoot, '->', destRoot);
}

