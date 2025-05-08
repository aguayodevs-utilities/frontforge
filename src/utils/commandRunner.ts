import { execa, Options as ExecaOptions } from 'execa'; // Corregido: No se necesita ExecaReturnValue aquí

/**
 * Ejecuta un comando de shell utilizando `execa`, mostrando su salida (stdout/stderr)
 * directamente en la consola actual.
 * Proporciona una forma estandarizada de ejecutar comandos externos dentro del CLI.
 * Incluye una corrección para ejecutar `npm` en Windows.
 *
 * @async
 * @function commandRunner
 * @param {string} cmd - El comando a ejecutar (ej. 'npm', 'git').
 * @param {string[]} [args=[]] - Un array de argumentos para pasar al comando.
 * @param {ExecaOptions} [options={}] - Opciones adicionales para pasar a `execa` (ej. `cwd` para cambiar el directorio de trabajo).
 *                                      `stdio` se establece en 'inherit' por defecto.
 *                                      `shell` se establece en true por defecto.
 * @returns {Promise<void>} - Promesa que se resuelve si el comando se ejecuta exitosamente (código de salida 0).
 *                            Se rechaza si el comando falla (código de salida distinto de 0).
 * @throws {ExecaError} - Si el comando falla, `execa` lanza un error que incluye detalles como `exitCode`, `stdout`, `stderr`.
 */
export async function commandRunner(
  cmd: string,
  args: string[] = [],
  options: ExecaOptions = {}
): Promise<void> { // Devuelve void, no el resultado del proceso
  let executableCmd = cmd;

  // Corrección específica para Windows: usar 'npm.cmd' en lugar de 'npm'
  if (process.platform === 'win32' && cmd.toLowerCase() === 'npm') {
    executableCmd = 'npm.cmd';
  }

  try {
    // Ejecutar el comando
    // stdio: 'inherit' -> Muestra la salida/error del comando en la consola principal
    // shell: true -> Permite usar sintaxis de shell, útil para algunos comandos
    // Se combinan las opciones por defecto con las proporcionadas
    await execa(executableCmd, args, { stdio: 'inherit', shell: true, ...options });
  } catch (error: any) {
    // Loguear un error más informativo antes de relanzar
    console.error(`❌ Error al ejecutar comando: ${executableCmd} ${args.join(' ')}`);
    console.error(`   (en directorio: ${options.cwd || process.cwd()})`);
    // Relanzar el error original de execa para que el flujo principal pueda manejarlo
    throw error;
  }
}
