import path from 'node:path';
import fs from 'fs-extra';
import { paramCase } from 'param-case';      // ← paquete específico

/** Copia controller / service y actualiza router del dominio. */
export async function copyBackendStubs(
  {domain, names}: {domain: string, names: { camel: string; pascal: string }}
) {
  const repo = process.cwd();
  const tplDir = path.join(__dirname, '..', '..', 'templates', 'backend');

  /* controller */
  await copyTpl(
    path.join(tplDir, 'controller.ts.tpl'),
    path.join(repo, 'src', 'controllers', domain, `${names.camel}.controller.ts`),
    domain,
    names
  );
  /* service */
  await copyTpl(
    path.join(tplDir, 'service.ts.tpl'),
    path.join(repo, 'src', 'services', domain, `${names.camel}.service.ts`),
    domain,
    names
  );
  /* router */
  await ensureRouter(domain, names.camel, names.pascal);
}

async function copyTpl(src: string, dest: string, domain: string, n: any) {
  let code = await fs.readFile(src, 'utf8');
  code = code.replace(/\${domain}/g, domain)
             .replace(/\${feature}/g, n.camel)
             .replace(/\${FeaturePascal}/g, n.pascal);
  await fs.ensureDir(path.dirname(dest));
  await fs.writeFile(dest, code, { flag: 'wx' });
}

async function ensureRouter(domain: string, feature: string, pascal: string) {
  const repo = process.cwd();
  const routerPath = path.join(repo, 'src', 'routes', domain, `route.${domain}.ts`);
  await fs.ensureDir(path.dirname(routerPath));

  const routeLine = `router${pascalCase(domain)}.get('/${feature}', ${feature}Controller.list);\n`;

  if (!(await fs.pathExists(routerPath))) {
    await fs.writeFile(
      routerPath,
      `import { Router } from 'express';
import { ${feature}Controller } from '../../controllers/${domain}/${feature}.controller';

export const router${pascalCase(domain)} = Router();

${routeLine}`
    );
  } else {
    const src = await fs.readFile(routerPath, 'utf8');
    if (!src.includes(routeLine.trim()))
      await fs.appendFile(routerPath, routeLine);
  }
}

function pascalCase(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}
