import fs from 'fs';
import path from 'path';

export async function configureVite({ projectFullPath }: { projectFullPath: string }) {
  const vite = path.join(projectFullPath, 'vite.config.ts');
  if (!fs.existsSync(vite)) return;

  const root = process.cwd();
  const sub = path.relative(path.join(root, 'fronts'), projectFullPath).split(path.sep).join('/');
  const base = `/${sub}`;
  const out_dir = path.join(root, 'public', sub);
  const out = path.relative(projectFullPath, out_dir).split(path.sep).join('/');
  /*
  console.log('---------------framework-----------------');
  console.log('root', root);
  console.log('sub', sub);
  console.log('base', base);
  console.log('out', out);  
  console.log('out_dir', out_dir);
  console.log('projectFullPath', projectFullPath);
  console.log('---------------framework-----------------');
  */
  let src = fs.readFileSync(vite, 'utf8');
  src = src.replace('__BASE_PATH__', base).replace('__OUT_DIR__', out);
  fs.writeFileSync(vite, src);

  console.log('✅  vite.config.ts configurado');
}
