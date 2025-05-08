import path from 'node:path';
import fs from 'fs-extra';
import { normalize }            from '../utils/normalize';
import { commandRunner }        from '../utils/commandRunner';
import { templateCopier }       from '../utils/templateCopier';

/* import { copyBackendStubs }     from '../tasks/backend/copyBackendStubs'; */
import { configureVite }        from '../tasks/preact/configureVite';
import { createPreact }         from '../tasks/preact/createPreact';
import { createTestComponent }  from '../tasks/template/createTestComponent';
import { deployAssets }         from '../tasks/template/deployAssets';
import { updateFrontsJson }     from '../tasks/template/updateFrontsJson';
import { updateIndexFile }      from '../tasks/template/updateIndexFile';
import { updatePackageJson }    from '../tasks/template/updatePackageJson';
import { updateShared }         from '../tasks/template/updateShared';
import { updateStylesFile }     from '../tasks/template/updateStylesFile';
import { createController }     from '../tasks/express/controller';
import { createService }        from '../tasks/express/service';

export async function createFrontend(
  domain: string,
  feature: string,
  argv: any
) {
  console.log("Ejecutando createPreact con:", {domain,feature})
  const names   = normalize(feature);               // { camel, pascal }
  const repo    = process.cwd();
  const parentFrontDir = path.join(repo, 'fronts', domain);
  const projectName = names.camel;
  const projectFullPath = path.join(parentFrontDir, projectName);
  const port = argv.port || 5173;
  const useRouter: boolean = argv.router ? true : false;

  
  console.log('🔍  Carpeta padre:', parentFrontDir);
  console.log('🔍  Carpeta proyecto:', projectFullPath);
  /** 1️⃣ Preact */
  await createPreact({ projectFullPath, useRouter });


  /* 1️⃣ Copiar plantilla base */
  // Ajustar ruta templatesDir para producción y desarrollo
  let templatesDir = path.resolve(__dirname, '..', '..', 'templates', 'frontend');
  if (__dirname.includes('dist')) {
    templatesDir = path.resolve(__dirname, '..', 'templates', 'frontend');
  }
  await templateCopier(templatesDir, projectFullPath);

  /* 2️⃣ Ajustar vite.config.ts */
  await configureVite({ projectFullPath });
  /* 4️⃣ Tareas sobre el front */
  await createTestComponent({ projectFullPath, projectName });
  await updateIndexFile({ projectFullPath });
  await updateStylesFile({ projectFullPath });
  await updatePackageJson({ projectFullPath, port });
  await updateShared({
    projectFullPath,
    runCommand: (cmd, args, opts = {}) =>
      commandRunner(cmd, args, { ...opts, cwd: projectFullPath })
  });
  await deployAssets({ projectFullPath });

  /* 5️⃣ Registrar en fronts.json */
  await updateFrontsJson({
    projectFullPath,
    projectName,
    port
  });

  /* 6️⃣ Instalar dependencias */
  console.log('📦  npm install …');
  await commandRunner('npm', ['install'], { cwd: projectFullPath });
  await commandRunner('npm', ['run', 'build:dev'], { cwd: projectFullPath });


  /* 3️⃣ Backend stubs */
  await createController({domain, feature: names.camel});
  await createService({domain, feature: names.camel});
  console.log(`✅  Micro-frontend /${domain}/${names.camel} generado`);
}
