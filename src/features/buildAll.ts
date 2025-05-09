import path from 'node:path';
import fs from 'fs-extra';
import { execa } from 'execa';

const CONFIG_DIR_NAME = '.frontforge';
const FRONTS_CONFIG_FILE_NAME = 'frontForgeFronts.json';

/**
 * @interface FrontConfigEntry
 * Define la estructura de una entrada en el archivo de configuración `.frontforge/frontForgeFronts.json`.
 * Cada entrada representa un micro-frontend y especifica su ubicación.
 * @property {string} [path] - Ruta relativa al micro-frontend desde la carpeta 'fronts/'. Usado si `projectFullPath` no está presente. (Considerar deprecación)
 * @property {string} projectFullPath - Ruta relativa a la raíz del repositorio del micro-frontend.
 */
interface FrontConfigEntry {
  path?: string; // Considerar deprecación en favor de solo projectFullPath
  projectFullPath: string; // Hacer este campo obligatorio
}

/**
 * Compila todos los micro-frontends definidos en el archivo `.frontforge/frontForgeFronts.json`.
 * Lee la configuración, determina la ruta de cada micro-frontend y ejecuta `npm run build` en su directorio.
 * Muestra logs del proceso de compilación.
 *
 * @async
 * @function buildAll
 * @returns {Promise<void>} Promesa que se resuelve cuando todos los builds han terminado (o fallado).
 * @throws {Error} Si no se encuentra o no se puede leer el archivo de configuración.
 */
export async function buildAll(): Promise<void> {
  const repoRoot = process.cwd();
  const frontforgeConfigDir = path.join(repoRoot, CONFIG_DIR_NAME);
  const frontsConfigPath = path.join(frontforgeConfigDir, FRONTS_CONFIG_FILE_NAME);
  
  console.log(`📄 Leyendo configuración desde: ${frontsConfigPath}`);

  let fronts: FrontConfigEntry[];
  try {
    // Asegura que el archivo exista antes de intentar leerlo
    if (!(await fs.pathExists(frontsConfigPath))) {
      throw new Error(`Archivo de configuración no encontrado: ${frontsConfigPath}`);
    }
    fronts = await fs.readJson(frontsConfigPath);
    if (!Array.isArray(fronts)) {
        throw new Error(`El contenido de ${frontsConfigPath} no es un array válido.`);
    }
  } catch (error: any) {
    console.error(`❌ Error al leer o parsear ${frontsConfigPath}:`, error.message);
    process.exit(1); // Termina si hay error de configuración
  }

  console.log(`🔎 Encontrados ${fronts.length} micro-frontends para compilar.`);

  for (const [index, frontConfig] of fronts.entries()) {
    let projectDir: string;

    // Determinar la ruta del proyecto, dando prioridad a projectFullPath
    if (frontConfig.projectFullPath) {
      projectDir = path.resolve(repoRoot, frontConfig.projectFullPath);
    } else if (frontConfig.path) { // Mantener por retrocompatibilidad, pero marcar para deprecación
      console.warn(`⚠️  Entrada ${index + 1}: La propiedad 'path' está obsoleta, usa 'projectFullPath' en su lugar.`);
      projectDir = path.join(repoRoot, 'fronts', frontConfig.path);
    } else {
      console.warn(`⚠️  Skipping entrada ${index + 1}: Falta 'projectFullPath' en la configuración.`);
      continue; 
    }

    // Verificar si el directorio existe
    if (!(await fs.pathExists(projectDir))) {
      console.warn(`⚠️  Skipping, directorio no encontrado: ${projectDir}`);
      continue;
    }

    const relativeProjectPath = path.relative(repoRoot, projectDir);
    console.log(`\n🔨 (${index + 1}/${fronts.length}) Compilando ${relativeProjectPath}...`);

    try {
      // Ejecutar npm run build en el directorio del proyecto
      await execa('npm', ['run', 'build'], { cwd: projectDir, stdio: 'inherit' });
      console.log(`✅ Compilación exitosa para ${relativeProjectPath}`);
    } catch (error: any) {
      console.error(`❌ Error al compilar ${relativeProjectPath}:`, error.message);
    }
  }
  console.log('\n✨ Proceso de compilación completado.');
}
