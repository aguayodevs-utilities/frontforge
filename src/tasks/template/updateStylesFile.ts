import fs from 'fs';
import path from 'path';
export async function updateStylesFile({ projectFullPath }: { projectFullPath: string }) {
  const css = path.join(projectFullPath, 'src', 'style.css');
  const base = `:root { font-family: system-ui, Avenir, Helvetica, Arial, sans-serif; }
a { color: var(--app-color-secondary); }
a:hover { color: var(--app-color-primary); }`;
  fs.writeFileSync(css, base);
  console.log('✅  style.css estándar');
};