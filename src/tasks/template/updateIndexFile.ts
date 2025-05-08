import fs from 'fs';
import path from 'path';
export async function updateIndexFile({ projectFullPath }: { projectFullPath: string }) {
  const idx = path.join(projectFullPath, 'src', 'index.tsx');
  if (!fs.existsSync(idx)) return;
  // Reemplaza solamente si el archivo provino del template
  let content = fs.readFileSync(idx, 'utf8');
  if (!content.includes('TestComponent')) {
    content = content.replace('</main>', '      <TestComponent />\n    </main>');
    fs.writeFileSync(idx, content);
    console.log('✅  index.tsx enriquecido');
  }
};