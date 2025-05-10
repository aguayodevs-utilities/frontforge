import path from 'node:path';
import fs from 'fs-extra';

interface CopyAndConfigureIndexOptions {
  projectRoot: string;
  withLogger: boolean;
}

/**
 * Copia y configura el archivo index.ts principal de la plantilla Express,
 * añadiendo la configuración de logging estructurado (Pino) si es necesario.
 *
 * @async
 * @function copyAndConfigureIndex
 * @param {CopyAndConfigureIndexOptions} options - Opciones de configuración.
 * @returns {Promise<void>} - Promesa que se resuelve cuando la copia y configuración han finalizado.
 * @throws {Error} - Si el archivo de plantilla no se encuentra o si ocurre un error.
 */
export async function copyAndConfigureIndex({ projectRoot, withLogger }: CopyAndConfigureIndexOptions): Promise<void> {
  const templatePath = path.join(__dirname, '..', '..', 'templates', 'backend-init', 'src', 'index.ts');
  const destinationPath = path.join(projectRoot, 'src', 'index.ts');

  console.log(`   -> Copiando y configurando index.ts a ${destinationPath}...`);

  try {
    if (!await fs.pathExists(templatePath)) {
      throw new Error(`Archivo de plantilla index.ts no encontrado: ${templatePath}`);
    }

    let content = await fs.readFile(templatePath, 'utf8');

    if (withLogger) {
      console.log('      -> Integrando configuración de logging (Pino)...');
      // Añadir importación de Pino
      content = `import pino from 'pino';\nimport pinoHttp from 'pino-http';\n${content}`;

      // Crear instancia del logger (después de las importaciones)
      const loggerInstance = `\nconst logger = pino({ level: process.env.LOG_LEVEL || 'info' });\n`;
      content = content.replace(/import express, { Express, Request, Response, NextFunction } from 'express';/, `import express, { Express, Request, Response, NextFunction } from 'express';${loggerInstance}`);


      // Añadir middleware de Pino HTTP (después de los middlewares esenciales)
      const pinoMiddleware = `\n// --- Middleware de Logging Estructurado (Pino) ---\napp.use(pinoHttp({ logger }));\n`;
      content = content.replace(/\/\/ --- Middlewares Esenciales ---/, `// --- Middlewares Esenciales ---${pinoMiddleware}`);
    }

    await fs.ensureDir(path.dirname(destinationPath)); // Asegurar que el directorio destino exista
    await fs.writeFile(destinationPath, content, 'utf8');

    console.log('   ✅ index.ts copiado y configurado exitosamente.');

  } catch (error: any) {
    console.error(`   ❌ Error al copiar o configurar index.ts:`, error.message);
    throw error;
  }
}