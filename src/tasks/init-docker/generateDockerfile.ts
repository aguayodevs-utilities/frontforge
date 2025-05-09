import path from 'node:path';
import fs from 'fs-extra';

/**
 * @interface GenerateDockerfileOptions
 * Opciones para la función `generateDockerfile`.
 * @property {string} projectRoot - Ruta absoluta al directorio raíz del proyecto.
 */
interface GenerateDockerfileOptions {
  projectRoot: string;
}

const DEFAULT_DOCKERFILE_CONTENT = `
# Fase 1: Build (si fuera necesario para un backend Node.js, por ahora solo Nginx)
# FROM node:18-alpine as builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# RUN npm run build

# Fase 2: Producción con Nginx
FROM nginx:alpine

# TODO: Copiar una configuración de Nginx personalizada
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# TODO: Copiar los assets estáticos de los frontends (del directorio public/)
# COPY public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
`;

/**
 * Genera un archivo Dockerfile básico en la raíz del proyecto.
 *
 * @async
 * @function generateDockerfile
 * @param {GenerateDockerfileOptions} options - Opciones de generación.
 * @returns {Promise<void>}
 */
export async function generateDockerfile({ projectRoot }: GenerateDockerfileOptions): Promise<void> {
  const dockerfilePath = path.join(projectRoot, 'Dockerfile');
  console.log(`   -> Generando Dockerfile en: ${dockerfilePath}`);

  try {
    if (await fs.pathExists(dockerfilePath)) {
      console.log(`      ℹ️  Dockerfile ya existe en ${dockerfilePath}. Omitiendo creación.`);
      // Podríamos preguntar si se desea sobrescribir o añadir lógica de merge si fuera necesario.
      return;
    }

    await fs.writeFile(dockerfilePath, DEFAULT_DOCKERFILE_CONTENT.trim());
    console.log('      ✅ Dockerfile generado exitosamente.');

  } catch (error: any) {
    console.error(`   ❌ Error al generar Dockerfile en ${dockerfilePath}:`, error.message);
    throw error;
  }
}