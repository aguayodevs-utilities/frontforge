import { execa, Options as ExecaOptions } from 'execa';

/**
 * Ejecuta un comando heredando stdout/stderr.
 */
export async function commandRunner(
  cmd: string,
  args: string[] = [],
  options: ExecaOptions = {}   // ⬅️ usa el alias tipado
): Promise<void> {
  if (process.platform === 'win32' && cmd === 'npm') cmd = 'npm.cmd';
  await execa(cmd, args, { stdio: 'inherit', shell: true, ...options });
}
