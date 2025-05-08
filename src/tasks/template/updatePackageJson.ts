import fs from 'fs-extra'; // Usar fs-extra para manejo robusto de JSON
import path from 'path';

/**
 * @interface UpdatePackageJsonOptions
 * Opciones para la función `updatePackageJson`.
 * @property {string} projectFullPath - Ruta absoluta al directorio del proyecto Preact.
 * @property {number} port - Puerto que se debe configurar en el script 'dev'.
 */
interface UpdatePackageJsonOptions {
  projectFullPath: string;
  port: number;
}

/**
 * Actualiza el archivo `package.json` de un proyecto Preact.
 * Específicamente:
 * - Asegura que el script `dev` incluya la opción `--port` con el puerto especificado.
 *   Si el script `dev` no existe, lo crea como `vite --port <port>`.
 *   Si ya existe pero no tiene `--port`, lo añade. Si ya lo tiene, no lo modifica.
 * - Asegura que el script `build:dev` exista con el comando `cross-env NODE_ENV=development vite build`.
 *
 * @async
 * @function updatePackageJson
 * @param {UpdatePackageJsonOptions} options - Opciones con la ruta del proyecto y el puerto.
 * @returns {Promise<void>} - No devuelve valor, modifica el archivo `package.json`.
 */
export async function updatePackageJson({ projectFullPath, port }: UpdatePackageJsonOptions): Promise<void> {
  const packageJsonPath = path.join(projectFullPath, 'package.json');

  // Verificar si package.json existe
  if (!await fs.pathExists(packageJsonPath)) {
    console.warn(`⚠️  Archivo no encontrado, omitiendo actualización de package.json: ${packageJsonPath}`);
    return;
  }

  try {
    // Leer el package.json
    const packageJson = await fs.readJson(packageJsonPath);

    // Asegurar que el objeto 'scripts' exista
    packageJson.scripts = packageJson.scripts || {};

    // Actualizar el script 'dev' para incluir el puerto
    const devScript: string = packageJson.scripts.dev || 'vite'; // Valor por defecto si no existe
    if (!devScript.includes('--port')) {
      // Añadir --port solo si no está presente
      packageJson.scripts.dev = `${devScript} --port ${port}`;
      console.log(`ℹ️  Añadiendo --port ${port} al script 'dev'.`);
    } else {
      console.log(`ℹ️  El script 'dev' ya incluye --port.`);
      // Opcional: podríamos intentar actualizar el puerto si ya existe, pero es más complejo y propenso a errores.
      // Por ahora, si ya tiene --port, no lo tocamos.
    }

    // Asegurar que el script 'build:dev' exista
    const buildDevCommand = 'cross-env NODE_ENV=development vite build';
    if (packageJson.scripts['build:dev'] !== buildDevCommand) {
        packageJson.scripts['build:dev'] = buildDevCommand;
        console.log(`ℹ️  Estableciendo/Actualizando script 'build:dev'.`);
    } else {
        console.log(`ℹ️  El script 'build:dev' ya está configurado correctamente.`);
    }


    // Escribir los cambios de vuelta al package.json con indentación
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    console.log(`✅ package.json actualizado (scripts dev y build:dev).`);

  } catch (error: any) {
    console.error(`❌ Error al actualizar ${packageJsonPath}:`, error.message);
    // Considerar relanzar el error si es crítico
    // throw error;
  }
};