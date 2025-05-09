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
# Fase de Producción con Nginx
FROM nginx:alpine

# Copiar la configuración de Nginx generada dinámicamente
# Se asume que copyNginxConfig la ha colocado en 'nginx/default.conf' en la raíz del proyecto.
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copiar los assets estáticos de los frontends
# Se asume que los frontends se compilan en el directorio 'public/' en la raíz del proyecto.
# Y que la estructura dentro de 'public/' es, por ejemplo, 'public/main/dashboard', 'public/admin/users', etc.
COPY public/ /usr/share/nginx/html/

# Exponer el puerto estándar de Nginx
EXPOSE 80

# Comando para iniciar Nginx en primer plano
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
      // Considerar preguntar si se desea sobrescribir. Por ahora, no se sobrescribe.
      return;
    }

    await fs.writeFile(dockerfilePath, DEFAULT_DOCKERFILE_CONTENT.trim());
    console.log('      ✅ Dockerfile generado exitosamente.');

  } catch (error: any) {
    console.error(`   ❌ Error al generar Dockerfile en ${dockerfilePath}:`, error.message);
    throw error;
  }
}