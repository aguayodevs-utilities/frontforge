import { commandRunner } from '../../utils/commandRunner';
import fs from 'fs'; // No usado actualmente, considerar eliminar
import path from 'node:path'; // No usado actualmente, considerar eliminar

/**
 * @interface CreatePreactOptions
 * Opciones para la función `createPreact`.
 * @property {string} projectFullPath - Ruta absoluta al directorio donde se creará el proyecto Preact.
 * @property {boolean} useRouter - Indica si se debe instalar el paquete de enrutamiento 'wouter'.
 */
interface CreatePreactOptions {
  projectFullPath: string;
  useRouter: boolean;
}

/**
 * Crea un nuevo proyecto Preact utilizando `npm init preact@latest` y luego
 * instala un conjunto base de dependencias de desarrollo y runtime.
 * Opcionalmente instala 'wouter' para enrutamiento.
 *
 * @async
 * @function createPreact
 * @param {CreatePreactOptions} options - Opciones para la creación del proyecto.
 * @returns {Promise<void>} Promesa que se resuelve cuando el proyecto base y las dependencias están instalados.
 * @throws {Error} Si alguno de los comandos `npm` falla.
 */
export async function createPreact({
  projectFullPath,
  useRouter,
}: CreatePreactOptions): Promise<void> {
  try {
    // --- 1. Scaffold del Proyecto con create-preact ---
    console.log(`🏗️  Generando esqueleto del proyecto Preact en: ${projectFullPath}`);
    // Ejecuta el inicializador oficial de Preact
    // Nota: Esto puede requerir interacción del usuario si no se proporcionan todas las opciones.
    // Considerar añadir flags a `init preact` si es posible para evitar prompts (ej. --name, --template, etc.)
    await commandRunner(
      'npm',
      // TODO: Investigar flags para `npm init preact@latest` para automatizar selección de plantilla (ts), no router, no prerender, no eslint.
      ['init', 'preact@latest', projectFullPath],
      { cwd: process.cwd(), stdio: 'inherit' } // Ejecutar en el directorio padre para que cree la carpeta `projectFullPath`
    );
    console.log('✅ Esqueleto del proyecto Preact generado.');

    // --- 2. Instalación Inicial (npm install) ---
    // create-preact generalmente ejecuta esto, pero lo aseguramos.
    console.log('📦 Ejecutando npm install inicial...');
    await commandRunner('npm', ['install'], { cwd: projectFullPath, stdio: 'inherit' });
    console.log('✅ Instalación inicial completada.');

    // --- 3. Instalación de Dependencias de Desarrollo Base ---
    console.log('📦 Instalando dependencias de desarrollo base...');
    const devDeps = ['@types/node', 'cross-env'];
    await commandRunner(
      'npm',
      ['install', '--save-dev', ...devDeps],
      { cwd: projectFullPath, stdio: 'inherit' }
    );
    console.log(`✅ Dependencias de desarrollo instaladas: ${devDeps.join(', ')}`);

    // --- 4. Instalación de Dependencias de Runtime Base ---
    console.log('📦 Instalando dependencias de runtime base...');
    const runtimeDeps = [
      'dotenv',             // Para variables de entorno
      '@emotion/react',     // Dependencias para MUI
      '@emotion/styled',
      '@mui/icons-material',
      '@mui/material',
      'axios',              // Para peticiones HTTP
    ];
    await commandRunner('npm', ['install', ...runtimeDeps], { cwd: projectFullPath, stdio: 'inherit' });
    console.log(`✅ Dependencias de runtime instaladas: ${runtimeDeps.join(', ')}`);

    // --- 5. Instalación Opcional de Router ---
    if (useRouter) {
      console.log('🧭 Instalando router (wouter)...');
      await commandRunner('npm', ['install', 'wouter'], { cwd: projectFullPath, stdio: 'inherit' });
      console.log('✅ Router instalado.');
    } else {
      console.log('🧭 Omitiendo instalación de router.');
    }

  } catch (error: any) {
    console.error(`❌ Error durante la creación base del proyecto Preact:`, error.message);
    // Podríamos querer eliminar la carpeta creada si falla a mitad de camino
    // await fs.remove(projectFullPath);
    throw error; // Re-lanzar el error para detener el proceso principal
  }
}
