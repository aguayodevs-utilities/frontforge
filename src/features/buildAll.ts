import path from 'node:path';
import fs from 'fs-extra';
import { execa } from 'execa';

/**
 * Recorre config/fronts.json y ejecuta `npm run build`
 * en cada micro-frontend listado.
 * Acepta entradas con:
 *   • path:  relativo a 'fronts/'
 *   • projectFullPath: ruta absoluta o relativa a repoRoot
 */
export async function buildAll(): Promise<void> {
  const repoRoot = process.cwd();

  interface FrontCfg {
    path?: string;
    projectFullPath?: string;
  }

  const fronts: FrontCfg[] = await fs.readJson(
    path.join(repoRoot, 'config', 'fronts.json')
  );

  for (const f of fronts) {
    const dir = f.projectFullPath
      ? path.resolve(repoRoot, f.projectFullPath)
      : path.join(repoRoot, 'fronts', f.path!);

    if (!(await fs.pathExists(dir))) {
      console.warn('⚠️  Skipping, directory not found:', dir);
      continue;
    }

    console.log('🔨 Building', path.relative(repoRoot, dir));
    await execa('npm', ['run', 'build'], { cwd: dir, stdio: 'inherit' });
  }
}
