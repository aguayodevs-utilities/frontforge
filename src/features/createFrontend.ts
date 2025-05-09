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

/**
 * Orquesta la creación completa de un micro-frontend Preact y sus stubs de backend Express.
 * Ejecuta una secuencia de tareas: creación base, copia de plantillas, configuración,
 * instalación de dependencias y generación de controlador/servicio.
 *
 * @async
 * @function createFrontend
 * @param {string} domain - El dominio o agrupación lógica para el micro-frontend (ej. 'admin', 'user/settings').
 * @param {string} feature - El nombre de la característica o micro-frontend (ej. 'reports', 'profile-editor'). Se normalizará a camelCase para el nombre del proyecto.
 * @param {object} argv - Objeto con argumentos adicionales de la línea de comandos (proporcionado por yargs). Se usa principalmente para obtener el puerto (`argv.port`).
 * @property {number} [argv.port=5173] - Puerto para el servidor de desarrollo Vite.
 * @property {boolean} [argv.router] - Indica si se debe incluir preact-router.
 * @returns {Promise<void>} Promesa que se resuelve cuando el proceso de creación ha finalizado.
 * @throws {Error} Si ocurre un error durante alguna de las tareas críticas.
 */
export async function createFrontend(
  domain: string,
  feature: string,
  argv: any // TODO: Tipar mejor argv si es posible, usando la interfaz de yargs
): Promise<void> {
  console.log(`🚀 Iniciando creación de micro-frontend: ${domain}/${feature}`);

  // --- 1. Preparación y Definición de Rutas ---
  const names = normalize(feature); // { camel: 'testFrontend', pascal: 'TestFrontend' }
  const repoRoot = process.cwd(); // Raíz del repositorio donde se ejecuta el comando
  const parentFrontDir = path.join(repoRoot, 'fronts', domain); // Carpeta contenedora del dominio
  const projectName = names.camel; // Nombre del proyecto/carpeta (ej. 'testFrontend')
  const projectFullPath = path.join(parentFrontDir, projectName); // Ruta completa al proyecto frontend
  const port = argv.port || 5173; // Puerto para dev server
  const useRouter: boolean = !!argv.router; // Convertir a booleano explícito

  console.log(`📂 Carpeta padre destino: ${parentFrontDir}`);
  console.log(`📁 Carpeta del proyecto: ${projectFullPath}`);
  console.log(`🔌 Puerto de desarrollo: ${port}`);
  console.log(`🧭 Usar router: ${useRouter}`); // Log para confirmar

  try {
    // --- 2. Creación Base del Proyecto Preact ---
    console.log('\n[Paso 1/7] Creando estructura base del proyecto Preact...');
    await createPreact({ projectFullPath, useRouter }); // Pasar useRouter
    console.log('✅ Estructura base Preact creada.');

    // --- 3. Copia y Configuración de Plantillas Base ---
    console.log('\n[Paso 2/7] Copiando y configurando plantillas base...');
    // Ruta a las plantillas frontend dentro de este paquete
    const templatesDir = path.join(__dirname, '..', 'templates', 'frontend'); // Ajustado para apuntar a dist/templates
    await templateCopier(templatesDir, projectFullPath);
    await configureVite({ projectFullPath }); // Ajusta vite.config.ts
    console.log('✅ Plantillas base copiadas y Vite configurado.');

    // --- 4. Modificaciones Específicas del Frontend ---
    console.log('\n[Paso 3/7] Aplicando modificaciones al frontend...');
    await createTestComponent({ projectFullPath, projectName }); // Crea un componente de ejemplo
    await updateIndexFile({ projectFullPath }); // Modifica src/index.tsx
    await updateStylesFile({ projectFullPath }); // Modifica src/style.css
    await updatePackageJson({ projectFullPath, port }); // Ajusta package.json (nombre, puerto dev)
    await updateShared({ // Instala y configura @aguayodevs-utilities/preact-shared
      projectFullPath,
      runCommand: (cmd, args, opts = {}) =>
        commandRunner(cmd, args, { ...opts, cwd: projectFullPath })
    });
    await deployAssets({ projectFullPath }); // Copia assets públicos si existen
    console.log('✅ Modificaciones del frontend aplicadas.');

    // --- 5. Registro en Configuración Global ---
    console.log('\n[Paso 4/7] Registrando micro-frontend en config/fronts.json...');
    await updateFrontsJson({ projectFullPath, projectName, port });
    console.log('✅ Micro-frontend registrado.');

    // --- 6. Instalación de Dependencias y Build Inicial ---
    console.log('\n[Paso 5/7] Instalando dependencias y compilando...');
    console.log('📦 Ejecutando npm install...');
    await commandRunner('npm', ['install'], { cwd: projectFullPath, stdio: 'inherit' });
    console.log('📦 Ejecutando npm run build:dev...');
    await commandRunner('npm', ['run', 'build:dev'], { cwd: projectFullPath, stdio: 'inherit' });
    console.log('✅ Dependencias instaladas y build inicial completado.');

    // --- 7. Generación de Stubs de Backend (Express) ---
    console.log('\n[Paso 6/7] Generando stubs de backend (Controller y Service)...');
    await createController({ domain, feature: names.camel });
    await createService({ domain, feature: names.camel });
    console.log('✅ Stubs de backend generados.');

    // --- Finalización ---
    console.log('\n[Paso 7/7] Proceso finalizado.');
    console.log(`\n🎉 Micro-frontend '${domain}/${names.camel}' generado exitosamente!`);
    console.log(`   Para iniciar en modo desarrollo, ejecuta:`);
    console.log(`   cd ${path.relative(repoRoot, projectFullPath)} && npm run dev`);

  } catch (error: any) {
    console.error('\n❌ Ocurrió un error durante la creación del micro-frontend:', error.message);
    // Considerar añadir más detalles del error si es necesario
    // console.error(error.stack);
    process.exit(1); // Terminar el proceso en caso de error
  }
}
