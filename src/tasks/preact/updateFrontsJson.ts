import fs from 'fs-extra'; // Usar fs-extra para readJson/writeJson
import path from 'path';

/**
 * @interface FrontsJsonEntry
 * Define la estructura de una entrada en el archivo `.frontforge/frontForgeFronts.json`.
 * @property {string} name - Nombre identificador del micro-frontend (usualmente camelCase).
 * @property {string} projectFullPath - Ruta relativa desde la raíz del repositorio hasta el directorio del micro-frontend.
 * @property {number} port - Puerto asignado para el servidor de desarrollo.
 */
interface FrontsJsonEntry {
  name: string;
  projectFullPath: string; 
  port: number;
}

/**
 * @interface UpdateFrontsJsonOptions
 * Opciones para la función `updateFrontsJson`.
 * @property {string} projectName - Nombre normalizado (camelCase) del proyecto.
 * @property {string} projectFullPath - Ruta absoluta al directorio del proyecto Preact.
 * @property {number} port - Puerto asignado para el servidor de desarrollo.
 */
interface UpdateFrontsJsonOptions {
  projectName: string;
  projectFullPath: string;
  port: number;
}

const CONFIG_DIR_NAME = '.frontforge';
const FRONTS_CONFIG_FILE_NAME = 'frontForgeFronts.json';

/**
 * Actualiza el archivo de configuración `.frontforge/frontForgeFronts.json` (creándolo si no existe)
 * para añadir o actualizar la entrada del micro-frontend especificado.
 * Almacena el nombre, la ruta relativa desde la raíz del repo y el puerto.
 *
 * @async
 * @function updateFrontsJson
 * @param {UpdateFrontsJsonOptions} options - Opciones con los detalles del micro-frontend.
 * @returns {Promise<void>} - No devuelve valor, modifica el archivo de configuración.
 */
export async function updateFrontsJson({ projectName, projectFullPath, port }: UpdateFrontsJsonOptions): Promise<void> {
  const repoRoot = process.cwd();
  const frontforgeConfigDir = path.join(repoRoot, CONFIG_DIR_NAME);
  const frontsConfigPath = path.join(frontforgeConfigDir, FRONTS_CONFIG_FILE_NAME);
  let frontsArray: FrontsJsonEntry[] = [];

  try {
    // Intentar leer el archivo JSON existente
    if (await fs.pathExists(frontsConfigPath)) {
      frontsArray = await fs.readJson(frontsConfigPath);
      // Asegurarse de que sea un array
      if (!Array.isArray(frontsArray)) {
        console.warn(`⚠️  El contenido de ${frontsConfigPath} no es un array. Se sobrescribirá.`);
        frontsArray = [];
      }
    }
  } catch (error: any) {
    console.warn(`⚠️  Error al leer ${frontsConfigPath}. Se creará uno nuevo. Error: ${error.message}`);
    frontsArray = []; // Resetear en caso de error de parseo
  }

  // Calcular la ruta relativa desde la raíz del repo
  const relativeProjectPath = path.relative(repoRoot, projectFullPath).split(path.sep).join('/');

  // Crear la nueva entrada o actualizar la existente
  const newEntry: FrontsJsonEntry = {
    name: projectName,
    projectFullPath: relativeProjectPath, 
    port: port
  };

  // Buscar si ya existe una entrada con el mismo nombre
  const existingIndex = frontsArray.findIndex((entry) => entry && entry.name === projectName); 

  if (existingIndex >= 0) {
    // Reemplazar la entrada existente
    console.log(`ℹ️  Actualizando entrada existente para '${projectName}' en ${FRONTS_CONFIG_FILE_NAME}.`);
    frontsArray[existingIndex] = newEntry;
  } else {
    // Añadir la nueva entrada
    console.log(`ℹ️  Añadiendo nueva entrada para '${projectName}' en ${FRONTS_CONFIG_FILE_NAME}.`);
    frontsArray.push(newEntry);
  }

  try {
    // Asegurar que el directorio .frontforge exista
    await fs.ensureDir(frontforgeConfigDir);
    // Escribir el array actualizado de vuelta al archivo JSON con indentación
    await fs.writeJson(frontsConfigPath, frontsArray, { spaces: 2 });
    console.log(`✅ ${FRONTS_CONFIG_FILE_NAME} actualizado.`);
  } catch (error: any) {
    console.error(`❌ Error al escribir en ${frontsConfigPath}:`, error.message);
  }
}