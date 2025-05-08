import path from 'node:path';
import fs from 'fs-extra';
import { commandRunner } from '../../utils/commandRunner';

/**
 * @interface InstallDependenciesOptions
 * Opciones para la función `installDependencies`.
 * @property {string} projectRoot - Ruta absoluta al directorio raíz del proyecto backend.
 * @property {boolean} [forceInstall=false] - Si es true, intentará instalar incluso si node_modules existe.
 */
interface InstallDependenciesOptions {
  projectRoot: string;
  forceInstall?: boolean;
}

/**
 * Instala las dependencias y devDependencies listadas en el `package.json` del proyecto.
 * Lee el `package.json`, extrae las listas de dependencias y ejecuta `npm install`
 * para cada grupo (producción y desarrollo).
 * Opcionalmente puede omitir la instalación si la carpeta `node_modules` ya existe,
 * a menos que `forceInstall` sea true.
 *
 * @async
 * @function installDependencies
 * @param {InstallDependenciesOptions} options - Opciones de instalación.
 * @returns {Promise<void>} - Promesa que se resuelve cuando la instalación finaliza o se omite.
 */
export async function installDependencies({ projectRoot, forceInstall = false }: InstallDependenciesOptions): Promise<void> {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const nodeModulesPath = path.join(projectRoot, 'node_modules');

  // Verificar si package.json existe
  if (!await fs.pathExists(packageJsonPath)) {
    console.warn(`   ⚠️  package.json no encontrado en ${projectRoot}. Omitiendo instalación de dependencias.`);
    return;
  }

  // Verificar si node_modules ya existe y no se fuerza la instalación
  if (!forceInstall && await fs.pathExists(nodeModulesPath)) {
      console.log(`   ℹ️  Directorio node_modules ya existe. Omitiendo instalación de dependencias (usa --force si es necesario).`);
      return;
  }

  console.log('   -> Instalando dependencias (puede tardar)...');
  try {
    // Leer el package.json para obtener las listas de dependencias
    const packageJson = await fs.readJson(packageJsonPath);
    const depsToInstall = Object.keys(packageJson.dependencies || {});
    const devDepsToInstall = Object.keys(packageJson.devDependencies || {});

    let installedSomething = false;

    // Instalar dependencias de producción
    if (depsToInstall.length > 0) {
      console.log(`      -> Instalando dependencias: ${depsToInstall.join(', ')}`);
      await commandRunner('npm', ['install', ...depsToInstall], { cwd: projectRoot, stdio: 'inherit' });
      installedSomething = true;
    } else {
      console.log(`      -> No hay dependencias de producción listadas.`);
    }

    // Instalar dependencias de desarrollo
    if (devDepsToInstall.length > 0) {
      console.log(`      -> Instalando dependencias de desarrollo: ${devDepsToInstall.join(', ')}`);
      await commandRunner('npm', ['install', '--save-dev', ...devDepsToInstall], { cwd: projectRoot, stdio: 'inherit' });
      installedSomething = true;
    } else {
      console.log(`      -> No hay dependencias de desarrollo listadas.`);
    }

    if (installedSomething) {
        console.log('   ✅ Dependencias instaladas.');
    } else {
        console.log('   ℹ️  No se encontraron dependencias para instalar.');
    }

  } catch (error: any) {
    console.error('   ❌ Error durante la instalación de dependencias. Ejecuta "npm install" manualmente.');
    // No relanzamos el error aquí para que el resto de la inicialización se considere completa,
    // pero el usuario verá el mensaje de error.
  }
}