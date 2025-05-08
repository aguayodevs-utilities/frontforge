/**
 * Instala el paquete compartido `fronts/shared` dentro del micro-frontend.
 *
 * @param projectFullPath Carpeta raíz del micro-frontend.
 * @param runCommand      Función que envuelve `execa` o similar.
 */
export declare function updateShared({ projectFullPath, runCommand }: {
    projectFullPath: string;
    runCommand: (command: string, args: string[], options?: {
        cwd?: string;
    }) => Promise<void>;
}): Promise<void>;
//# sourceMappingURL=updateShared.d.ts.map