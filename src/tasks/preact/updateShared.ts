/**
 * Interfaz para la función `commandRunner` o una envoltura similar.
 * Define una función asíncrona que ejecuta un comando de shell.
 */
interface CommandRunnerFunc {
  (
    command: string,
    args: string[],
    options?: { cwd?: string; stdio?: 'inherit' | 'pipe' } // Añadir stdio si es necesario
  ): Promise<void>; // Asumiendo que no devuelve nada o no nos importa el resultado aquí
}

/**
 * @interface UpdateSharedOptions
 * Opciones para la función `updateShared`.
 * @property {string} projectFullPath - Ruta absoluta al directorio del proyecto Preact.
 * @property {CommandRunnerFunc} runCommand - Función para ejecutar comandos de shell (inyectada).
 */
interface UpdateSharedOptions {
  projectFullPath: string;
  runCommand: CommandRunnerFunc;
}

/**
 * Instala el paquete compartido `@aguayodevs-utilities/preact-shared`
 * como una dependencia en el micro-frontend especificado.
 *
 * **Nota:** El nombre `updateShared` podría ser confuso; la función principalmente *instala* el paquete.
 *
 * @async
 * @function updateShared
 * @param {UpdateSharedOptions} options - Opciones con la ruta del proyecto y la función para ejecutar comandos.
 * @returns {Promise<void>} - Promesa que se resuelve cuando el comando de instalación finaliza.
 * @throws {Error} - Si el comando `npm install` falla.
 */
export async function updateShared({
  projectFullPath,
  runCommand
}: UpdateSharedOptions): Promise<void> {
  const sharedPackageName = '@aguayodevs-utilities/preact-shared';
  console.log(`📂 Instalando paquete compartido: ${sharedPackageName}...`);

  try {
    // Corregir: pasar el nombre del paquete como un argumento separado en el array
    await runCommand(
        'npm',
        ['install', sharedPackageName], // Corregido
        { cwd: projectFullPath, stdio: 'inherit' } // Usar stdio: 'inherit' para ver salida de npm
    );
    console.log(`✅ Paquete compartido ${sharedPackageName} instalado.`);
  } catch (error: any) {
    console.error(`❌ Error al instalar ${sharedPackageName}:`, error.message);
    throw error; // Re-lanzar para detener el proceso principal
  }
}