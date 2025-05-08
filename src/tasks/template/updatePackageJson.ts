import fs from 'fs';
import path from 'path';
export async function updatePackageJson({ projectFullPath, port }: { projectFullPath: string, port: number }) {
  const pkg = path.join(projectFullPath, 'package.json');
  if (!fs.existsSync(pkg)) return;
  const json = JSON.parse(fs.readFileSync(pkg, 'utf8'));
  json.scripts = json.scripts || {};
  json.scripts.dev = json.scripts.dev && json.scripts.dev.includes('--port')
    ? json.scripts.dev
    : `${json.scripts.dev || 'vite'} --port ${port}`;
  json.scripts["build:dev"] = json.scripts["build:dev"] || 'cross-env NODE_ENV=development vite build';
  fs.writeFileSync(pkg, JSON.stringify(json, null, 2));
  console.log('✅  script dev actualizado');
};