import path from 'node:path';
import fs from 'fs-extra';

/**
 * Añade un archivo .env.<environment> para configurar variables por entorno.
 * (Implementación pendiente)
 *
 * @async
 * @function addEnvironmentFile
 * @param {string} environment - El nombre del entorno.
 * @returns {Promise<void>}
 */
export async function addEnvironmentFile(environment: string): Promise<void> {
  console.log(`🚀 Añadiendo archivo .env para entorno: ${environment}...`);

  const projectRoot = process.cwd(); // Asumimos que el comando se ejecuta en la raíz del proyecto
  const envFilePath = path.join(projectRoot, `.env.${environment}`);

  // Contenido base para el archivo .env.<environment>
  const baseEnvContent = `# Variables de entorno para el entorno: ${environment.toUpperCase()}
PORT=3000 # Cambia el puerto si es necesario para este entorno
JWT_SECRET=TU_SECRETO_JWT_AQUI_CAMBIAME # Asegúrate de usar un secreto único y seguro
NODE_ENV=${environment}
# Añade otras variables específicas de ${environment} aquí (ej. DATABASE_URL, API_KEY)
`;

  try {
    // Verificar si el archivo ya existe
    if (await fs.pathExists(envFilePath)) {
      console.warn(`⚠️  El archivo .env.${environment} ya existe en ${projectRoot}. Omitiendo creación.`);
      return; // Salir si ya existe
    }

    // Escribir el contenido al archivo
    await fs.writeFile(envFilePath, baseEnvContent, 'utf8');

    console.log(`✅ Archivo .env.${environment} creado exitosamente en: ${envFilePath}`);
    console.log(`   -> Recuerda configurar las variables de entorno específicas para el entorno "${environment}".`);

  } catch (error: any) {
    console.error(`❌ Error al crear el archivo .env.${environment}:`, error.message);
    process.exit(1);
  }
}