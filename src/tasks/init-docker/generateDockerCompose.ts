import path from 'node:path';
import fs from 'fs-extra';

/**
 * @interface GenerateDockerComposeOptions
 * Opciones para la función `generateDockerCompose`.
 * @property {string} projectRoot - Ruta absoluta al directorio raíz del proyecto.
 * @property {string} [serviceName='web'] - Nombre del servicio en docker-compose.
 */
interface GenerateDockerComposeOptions {
  projectRoot: string;
  serviceName?: string;
}

/**
 * Genera un archivo docker-compose.yml básico en la raíz del proyecto.
 *
 * @async
 * @function generateDockerCompose
 * @param {GenerateDockerComposeOptions} options - Opciones de generación.
 * @returns {Promise<void>}
 */
export async function generateDockerCompose({ projectRoot, serviceName = 'web' }: GenerateDockerComposeOptions): Promise<void> {
  const composePath = path.join(projectRoot, 'docker-compose.yml');
  console.log(`   -> Generando docker-compose.yml en: ${composePath}`);

  const composeContent = `
version: '3.8'

services:
  ${serviceName}:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80" 
    # volumes: # Descomentar y ajustar si se necesita montaje de volúmenes en desarrollo
      # - ./public:/usr/share/nginx/html # Ejemplo para Nginx
      # - ./src:/app/src # Ejemplo para un backend Node.js
    restart: unless-stopped
`;

  try {
    if (await fs.pathExists(composePath)) {
      console.log(`      ℹ️  docker-compose.yml ya existe en ${composePath}. Omitiendo creación.`);
      return;
    }

    await fs.writeFile(composePath, composeContent.trim());
    console.log('      ✅ docker-compose.yml generado exitosamente.');

  } catch (error: any) {
    console.error(`   ❌ Error al generar docker-compose.yml en ${composePath}:`, error.message);
    throw error;
  }
}