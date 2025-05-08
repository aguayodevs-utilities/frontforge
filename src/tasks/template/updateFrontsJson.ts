import fs from 'fs';
import path from 'path';
export async function updateFrontsJson({ projectName, projectFullPath, port }: { projectName: string, projectFullPath: string, port: number }) {
  const fronts = path.join(process.cwd(), 'fronts.json');
  let arr = [];
  if (fs.existsSync(fronts)) {
    try { arr = JSON.parse(fs.readFileSync(fronts, 'utf8')); } catch { arr = []; }
  }
  if (!Array.isArray(arr)) arr = [];
  const rel = path.relative(process.cwd(), projectFullPath);
  const idx = arr.findIndex((e) => e.name === projectName);
  const entry = { name: projectName, path: rel, port };
  idx >= 0 ? arr.splice(idx, 1, entry) : arr.push(entry);
  fs.writeFileSync(fronts, JSON.stringify(arr, null, 2));
  console.log('✅  fronts.json actualizado');
};