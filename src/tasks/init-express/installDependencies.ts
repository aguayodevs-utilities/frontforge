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
  withLogger?: boolean; // Nueva opción para incluir logger
}

// Definición del package.json base con las dependencias necesarias
// Se usa como fuente para saber qué instalar, independientemente del package.json existente.
const BASE_PACKAGE_JSON = {
  dependencies: {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2"
    // Añadir más dependencias base si son necesarias
  },
  devDependencies: {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node": "^20.14.11",
    "@typescript-eslint/eslint-plugin": "^7.16.1",
    "@typescript-eslint/parser": "^7.16.1",
    "cross-env": "^7.0.3",
    "eslint": "^8.57.0",
    "nodemon": "^3.1.4",
    "ts-node": "^10.9.2",
    "typescript": "^5.5.3",
    "jest": "^29.7.0", // Añadir Jest
    "@types/jest": "^29.5.12", // Añadir tipos de Jest
    "supertest": "^7.0.0", // Añadir Supertest
    "@types/supertest": "^6.0.2", // Añadir tipos de Supertest
    "ts-jest": "^29.1.5" // Añadir ts-jest para usar Jest con TypeScript
     // Añadir más devDependencies base si son necesarias
   }
};


/**
 * Instala las dependencias y devDependencies *base* definidas para el backend,
 * leyéndolas desde una configuración interna (`BASE_PACKAGE_JSON`).
 * Ejecuta `npm install` para cada grupo (producción y desarrollo).
 * Opcionalmente puede omitir la instalación si la carpeta `node_modules` ya existe,
 * a menos que `forceInstall` sea true.
 *
 * @async
 * @function installDependencies
 * @param {InstallDependenciesOptions} options - Opciones de instalación.
 * @returns {Promise<void>} - Promesa que se resuelve cuando la instalación finaliza o se omite.
 */
export async function installDependencies({ projectRoot, forceInstall = false, withLogger = false }: InstallDependenciesOptions): Promise<void> {
  const nodeModulesPath = path.join(projectRoot, 'node_modules');

  // Dependencias y devDependencies base
  const baseDeps = { ...BASE_PACKAGE_JSON.dependencies };
  const baseDevDeps = { ...BASE_PACKAGE_JSON.devDependencies };

  // Añadir dependencias del logger si la opción está activada
  if (withLogger) {
    console.log('   ℹ️  Incluyendo dependencias para logging estructurado (Pino).');
    baseDeps['pino'] = '^9.2.0'; // Usar una versión reciente
    baseDevDeps['@types/pino'] = '^7.0.5'; // Usar una versión reciente compatible
  }

  // Verificar si node_modules ya existe y no se fuerza la instalación

  if (!forceInstall && await fs.pathExists(nodeModulesPath)) {
      console.log(`   ℹ️  Directorio node_modules ya existe. Omitiendo instalación de dependencias (usa --force si es necesario).`);
      return;
  }

  console.log('   -> Instalando dependencias base del backend (puede tardar)...');
  try {
    // Obtener listas de dependencias a instalar (base + condicionales)
    const depsToInstall = Object.keys(baseDeps);
    const devDepsToInstall = Object.keys(baseDevDeps);

    let installedSomething = false;

    // Instalar dependencias de producción
    if (depsToInstall.length > 0) {
      console.log(`      -> Instalando dependencias: ${depsToInstall.join(', ')}`);
      await commandRunner('npm', ['install', ...depsToInstall], { cwd: projectRoot, stdio: 'inherit' });
      installedSomething = true;
    } else {
      console.log(`      -> No hay dependencias de producción base definidas para instalar.`);
    }

    // Instalar dependencias de desarrollo base
    if (devDepsToInstall.length > 0) {
      console.log(`      -> Instalando dependencias de desarrollo: ${devDepsToInstall.join(', ')}`);
      await commandRunner('npm', ['install', '--save-dev', ...devDepsToInstall], { cwd: projectRoot, stdio: 'inherit' });
      installedSomething = true;
    } else {
      console.log(`      -> No hay dependencias de desarrollo base definidas para instalar.`);
    }

    if (installedSomething) {
        console.log('   ✅ Dependencias base instaladas/actualizadas.');
    } else {
        console.log('   ℹ️  No se encontraron dependencias base para instalar.');
    }

  } catch (error: any) {
    console.error('   ❌ Error durante la instalación de dependencias base. Ejecuta "npm install" manualmente si es necesario.');
    // No relanzamos el error aquí para que el resto de la inicialización se considere completa,
    // pero el usuario verá el mensaje de error.
  }
}