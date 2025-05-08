
/**
 * Instala el paquete compartido `fronts/shared` dentro del micro-frontend.
 *
 * @param projectFullPath Carpeta raíz del micro-frontend.
 * @param runCommand      Función que envuelve `execa` o similar.
 */
export async function updateShared(
  {
    projectFullPath,
    runCommand
  }: {
    projectFullPath: string;
    runCommand: (
      command: string,
      args: string[],
      options?: { cwd?: string }   //  <-- opcional
    ) => Promise<void>;
  }
): Promise<void> {

  console.log('📂  Instalando @aguayodevs-utilities/preact-shared');
  await runCommand('npm', ['install @aguayodevs-utilities/preact-shared'], { cwd: projectFullPath });
}