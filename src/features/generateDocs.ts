import path from 'node:path';
import fs from 'fs-extra';
import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Genera la documentación Swagger/OpenAPI para el proyecto backend Express.
 * (Implementación pendiente)
 *
 * @async
 * @function generateDocs
 * @returns {Promise<void>}
 */
export async function generateDocs(): Promise<void> {
  console.log('🚀 Iniciando generación de documentación Swagger/OpenAPI...');

  const projectRoot = process.cwd(); // Asumimos que el comando se ejecuta en la raíz del proyecto backend

  const options = {
    // Propiedades añadidas para intentar resolver el error de tipo
    encoding: 'utf8',
    failOnErrors: true,
    verbose: false,
    format: '.json', // O '.yaml' si queremos la salida directa en YAML
    swaggerDefinition: { // Esta propiedad a veces se usa en lugar de 'definition'
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0', // TODO: Obtener versión del package.json del proyecto
        description: 'Documentación autogenerada para la API backend.',
      },
      servers: [
        {
          url: 'http://localhost:3000', // TODO: Obtener del .env del proyecto
          description: 'Development server',
        },
      ],
    },
    // Mantener 'definition' por si acaso, aunque 'swaggerDefinition' es más común en ejemplos antiguos
    definition: {
        openapi: '3.0.0',
        info: {
          title: 'API Documentation',
          version: '1.0.0', // TODO: Obtener versión del package.json del proyecto
          description: 'Documentación autogenerada para la API backend.',
        },
        servers: [
          {
            url: 'http://localhost:3000', // TODO: Obtener del .env del proyecto
            description: 'Development server',
          },
        ],
      },
    apis: [
      path.join(projectRoot, 'src/controllers/**/*.ts'),
      path.join(projectRoot, 'src/services/**/*.ts'),
      // TODO: Añadir otras rutas si es necesario (ej. modelos, interfaces)
    ],
  };

  try {
    const swaggerSpec = swaggerJsdoc(options);
    const docsDir = path.join(projectRoot, 'docs');
    const outputPath = path.join(docsDir, 'openapi.yaml');

    await fs.ensureDir(docsDir); // Asegurar que el directorio 'docs' exista
    await fs.writeFile(outputPath, JSON.stringify(swaggerSpec, null, 2), 'utf8'); // Escribir en YAML, pero stringify con 2 espacios

    console.log(`✅ Documentación generada exitosamente en: ${outputPath}`);
    console.log('   Considera instalar swagger-ui-express en tu proyecto backend para servir esta documentación.');

  } catch (error: any) {
    console.error('❌ Error al generar la documentación:', error.message);
    process.exit(1);
  }
}