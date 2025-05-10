import path from 'node:path';
import fs from 'fs-extra';
import { commandRunner } from '../utils/commandRunner'; // Importar utilidad para ejecutar comandos
// TODO: Importar dependencias necesarias para Husky, ESLint, Prettier
 
/**
 * Inicializa la configuración de ESLint, Prettier y Husky para el proyecto.
 * (Implementación pendiente)
 *
 * @async
 * @function initializeLinting
 * @returns {Promise<void>}
 */
export async function initializeLinting(): Promise<void> {
  console.log('🚀 Iniciando configuración de Linting, Prettier y Husky...');

  const projectRoot = process.cwd(); // Asumimos que el comando se ejecuta en la raíz del proyecto
  const packageJsonPath = path.join(projectRoot, 'package.json');

  // Dependencias de desarrollo necesarias
  const devDependenciesToAdd = {
    "eslint": "^8.57.0", // Usar versiones recientes
    "@typescript-eslint/eslint-plugin": "^7.16.1",
    "@typescript-eslint/parser": "^7.16.1",
    "prettier": "^3.3.2",
    "eslint-config-prettier": "^9.1.0", // Para integrar Prettier con ESLint
    "eslint-plugin-prettier": "^5.1.3",
    "husky": "^9.0.11",
    "lint-staged": "^15.2.7" // Para ejecutar linters en archivos staged
  };

  try {
    // 1. Añadir dependencias al package.json
    console.log('   -> Añadiendo dependencias de desarrollo a package.json...');
    if (!await fs.pathExists(packageJsonPath)) {
      console.error(`   ❌ Error: No se encontró package.json en ${projectRoot}. Asegúrate de ejecutar este comando en la raíz de tu proyecto.`);
      process.exit(1);
    }

    const packageJson = await fs.readJson(packageJsonPath);

    // Asegurar que devDependencies existe
    if (!packageJson.devDependencies) {
      packageJson.devDependencies = {};
    }

    // Añadir nuevas dependencias (sobrescribir si ya existen para asegurar versiones)
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...devDependenciesToAdd
    };

    // Añadir script para husky install
    if (!packageJson.scripts) {
        packageJson.scripts = {};
    }
    packageJson.scripts.prepare = "husky || true"; // Script para instalar husky hooks

    // Añadir configuración de lint-staged
    packageJson['lint-staged'] = {
        "*.{ts,tsx,js,jsx,json,md,css,scss,yaml,yml}": [
            "prettier --write",
            "eslint --fix"
        ]
    };


    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    console.log('   ✅ Dependencias añadidas a package.json.');

    // 2. Instalar dependencias
    console.log('   -> Ejecutando npm install para instalar las nuevas dependencias...');
    await commandRunner('npm', ['install'], { cwd: projectRoot, stdio: 'inherit' });
    console.log('   ✅ Dependencias instaladas.');

    // 3. Configurar Husky (se hace con el script 'prepare' y lint-staged)
    console.log('   -> Configurando Husky y lint-staged...');
    // El script 'prepare' en package.json se encarga de instalar los hooks de husky
    // lint-staged se configura directamente en package.json
    console.log('   ✅ Husky y lint-staged configurados.');


    // 4. Copiar archivos de configuración
    console.log('   -> Copiando archivos de configuración de ESLint y Prettier...');
    const lintingTemplatesDir = path.join(__dirname, '..', '..', 'templates', 'linting');
    const eslintConfigPath = path.join(lintingTemplatesDir, '.eslintrc.json');
    const prettierConfigPath = path.join(lintingTemplatesDir, '.prettierrc.js');

    await fs.copy(eslintConfigPath, path.join(projectRoot, '.eslintrc.json'));
    await fs.copy(prettierConfigPath, path.join(projectRoot, '.prettierrc.js'));

    console.log('   ✅ Archivos de configuración copiados.');

    console.log('✅ Configuración de Linting, Prettier y Husky completada.');

  } catch (error: any) {
    console.error('❌ Ocurrió un error durante la inicialización de linting:', error.message);
    process.exit(1);
  }
}