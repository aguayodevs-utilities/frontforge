import path from 'node:path';
import fs from 'fs-extra';
import { templateCopier } from '../../utils/templateCopier'; // Reutilizar templateCopier

/**
 * @interface CopyNginxConfigOptions
 * Opciones para la función `copyNginxConfig`.
 * @property {string} projectRoot - Ruta absoluta al directorio raíz del proyecto.
 * @property {string} [nginxConfigDir='nginx'] - Nombre del directorio donde se guardará la config de Nginx.
 */
interface CopyNginxConfigOptions {
  projectRoot: string;
  nginxConfigDir?: string;
}

/**
 * Copia la plantilla de configuración de Nginx al proyecto del usuario.
 *
 * @async
 * @function copyNginxConfig
 * @param {CopyNginxConfigOptions} options - Opciones de copia.
 * @returns {Promise<void>}
 */
export async function copyNginxConfig({ projectRoot, nginxConfigDir = 'nginx' }: CopyNginxConfigOptions): Promise<void> {
  const templateSourceDir = path.join(__dirname, '..', '..', 'templates', 'docker'); // Ruta a templates/docker
  const destinationDir = path.join(projectRoot, nginxConfigDir);

  console.log(`   -> Copiando plantilla de configuración de Nginx a ${destinationDir}...`);

  try {
    // Asegurar que el directorio de destino exista
    await fs.ensureDir(destinationDir);

    // Copiar el archivo default.conf.tpl (o todos los archivos de templates/docker si hay más)
    // Por ahora, copiamos el archivo específico y lo renombramos a default.conf
    const sourceFile = path.join(templateSourceDir, 'default.conf.tpl');
    const destFile = path.join(destinationDir, 'default.conf');
    
    if (!await fs.pathExists(sourceFile)) {
        throw new Error(`Plantilla de Nginx no encontrada en: ${sourceFile}`);
    }

    await fs.copyFile(sourceFile, destFile);
    // Si quisiéramos copiar todo el directorio 'docker' a 'nginx':
    // await templateCopier(templateSourceDir, destinationDir);
    
    console.log(`      ✅ Configuración de Nginx copiada a ${destFile}`);

  } catch (error: any) {
    console.error(`   ❌ Error al copiar configuración de Nginx a ${destinationDir}:`, error.message);
    throw error;
  }
}