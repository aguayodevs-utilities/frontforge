import path from 'node:path';
import fs from 'fs-extra';
import { normalize }            from '../utils/normalize';
import { commandRunner }        from '../utils/commandRunner';
import { templateCopier }       from '../utils/templateCopier';

// Tareas específicas para Preact
import { configureVite }        from '../tasks/preact/configureVite';
import { createPreact }         from '../tasks/preact/createPreact';

// Tareas de manipulación de plantillas y configuración (ahora en preact)
import { createTestComponent }  from '../tasks/preact/createTestComponent';
import { deployAssets }         from '../tasks/preact/deployAssets';
import { updateFrontsJson }     from '../tasks/preact/updateFrontsJson';
import { updateIndexFile }      from '../tasks/preact/updateIndexFile';
import { updatePackageJson }    from '../tasks/preact/updatePackageJson';
import { updateShared }         from '../tasks/preact/updateShared';
import { updateStylesFile }     from '../tasks/preact/updateStylesFile';

// Tareas para generar stubs de backend Express
import { createController }     from '../tasks/express/controller';
import { createService }        from '../tasks/express/service';

// Tareas para Docker (si se necesitan aquí en el futuro, ej. para actualizar nginx.conf)
// import { copyNginxConfig } from '../tasks/init-docker/copyNginxConfig'; // Ejemplo

const CONFIG_DIR_NAME = '.frontforge';
const PROJECT_CONFIG_FILE_NAME = 'config.json';
interface ProjectConfig {
  backendType: 'express' | 'docker' | string;
}

/**
 * Orquesta la creación completa de un micro-frontend Preact.
 * Condicionalmente genera stubs de backend Express si el proyecto base es de tipo 'express'.
 *
 * @async
 * @function createFrontend
 * @param {string} domain - El dominio o agrupación lógica para el micro-frontend.
 * @param {string} feature - El nombre de la característica o micro-frontend.
 * @param {object} argv - Argumentos de la línea de comandos.
 * @returns {Promise<void>}
 */
export async function createFrontend(
  domain: string,
  feature: string,
  argv: any 
): Promise<void> {
  console.log(`🚀 Iniciando creación de micro-frontend: ${domain}/${feature}`);

  const names = normalize(feature); 
  const repoRoot = process.cwd(); 
  const parentFrontDir = path.join(repoRoot, 'fronts', domain); 
  const projectName = names.camel; 
  const projectFullPath = path.join(parentFrontDir, projectName); 
  const port = argv.port || 5173; 
  const useRouter: boolean = !!argv.router; 

  console.log(`📂 Carpeta padre destino: ${parentFrontDir}`);
  console.log(`📁 Carpeta del proyecto: ${projectFullPath}`);
  console.log(`🔌 Puerto de desarrollo: ${port}`);
  console.log(`🧭 Usar router: ${useRouter}`); 

  let projectConfig: ProjectConfig = { backendType: 'unknown' }; // Default
  try {
    const projectConfigPath = path.join(repoRoot, CONFIG_DIR_NAME, PROJECT_CONFIG_FILE_NAME);
    if (await fs.pathExists(projectConfigPath)) {
      projectConfig = await fs.readJson(projectConfigPath);
    } else {
      console.warn(`⚠️  Archivo de configuración del proyecto (${projectConfigPath}) no encontrado. No se generarán stubs de backend específicos.`);
    }
  } catch (error: any) {
    console.warn(`⚠️  Error al leer ${PROJECT_CONFIG_FILE_NAME}: ${error.message}. No se generarán stubs de backend específicos.`);
  }
  console.log(`ℹ️  Tipo de backend detectado: ${projectConfig.backendType}`);


  try {
    console.log('\n[Paso 1/7] Creando estructura base del proyecto Preact...');
    await createPreact({ projectFullPath, useRouter }); 
    console.log('✅ Estructura base Preact creada.');

    console.log('\n[Paso 2/7] Copiando y configurando plantillas base...');
    const templatesDir = path.join(__dirname, '..', 'templates', 'frontend'); 
    await templateCopier(templatesDir, projectFullPath);
    await configureVite({ projectFullPath }); 
    console.log('✅ Plantillas base copiadas y Vite configurado.');

    console.log('\n[Paso 3/7] Aplicando modificaciones al frontend...');
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
    console.log('✅ Modificaciones del frontend aplicadas.');

    console.log(`\n[Paso 4/7] Registrando micro-frontend en ${CONFIG_DIR_NAME}/frontForgeFronts.json...`);
    await updateFrontsJson({ projectFullPath, projectName, port });
    console.log('✅ Micro-frontend registrado.');

    console.log('\n[Paso 5/7] Instalando dependencias y compilando...');
    console.log('📦 Ejecutando npm install...');
    await commandRunner('npm', ['install'], { cwd: projectFullPath, stdio: 'inherit' });
    console.log('📦 Ejecutando npm run build:dev...');
    await commandRunner('npm', ['run', 'build:dev'], { cwd: projectFullPath, stdio: 'inherit' });
    console.log('✅ Dependencias instaladas y build inicial completado.');

    if (projectConfig.backendType === 'express') {
      console.log('\n[Paso 6/7] Generando stubs de backend (Controller y Service para Express)...');
      await createController({ domain, feature: names.camel });
      await createService({ domain, feature: names.camel });
      console.log('✅ Stubs de backend generados.');
    } else if (projectConfig.backendType === 'docker') {
      console.log('\n[Paso 6/7] Proyecto tipo Docker. Omitiendo generación de stubs de backend Express.');
      // Aquí se podría añadir lógica para actualizar nginx.conf si fuera necesario
      // Por ejemplo, llamar a una tarea que regenere nginx/default.conf
      // await regenerateNginxConfigForDocker({ projectRoot }); 
      console.log('   -> Asegúrate de que tu Dockerfile y Nginx estén configurados para servir este nuevo frontend.');
    } else {
      console.log('\n[Paso 6/7] Tipo de backend no es Express. Omitiendo generación de stubs de backend.');
    }

    console.log('\n[Paso 7/7] Proceso finalizado.');
    console.log(`\n🎉 Micro-frontend '${domain}/${names.camel}' generado exitosamente!`);
    console.log(`   Para iniciar en modo desarrollo, ejecuta:`);
    console.log(`   cd ${path.relative(repoRoot, projectFullPath)} && npm run dev`);

  } catch (error: any) {
    console.error('\n❌ Ocurrió un error durante la creación del micro-frontend:', error.message);
    process.exit(1); 
  }
}
