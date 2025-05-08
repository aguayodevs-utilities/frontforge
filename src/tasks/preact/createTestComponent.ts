import fs from 'fs';
import path from 'path';

/**
 * @interface CreateTestComponentOptions
 * Opciones para la función `createTestComponent`.
 * @property {string} projectFullPath - Ruta absoluta al directorio del proyecto Preact.
 * @property {string} projectName - Nombre normalizado (camelCase) del proyecto, usado en el mensaje de bienvenida.
 */
interface CreateTestComponentOptions {
  projectFullPath: string;
  projectName: string;
}

/**
 * Crea un componente React de ejemplo (`TestComponent.tsx`) dentro de la carpeta `src/components`
 * del proyecto Preact especificado.
 * El componente muestra un título de bienvenida utilizando el nombre del proyecto.
 * Si el archivo ya existe, la función no hace nada.
 *
 * @async
 * @function createTestComponent
 * @param {CreateTestComponentOptions} options - Opciones que incluyen la ruta y el nombre del proyecto.
 * @returns {Promise<void>} - No devuelve valor, escribe el archivo directamente si es necesario.
 */
export async function createTestComponent({ projectFullPath, projectName }: CreateTestComponentOptions): Promise<void> {
  try {
    // Define el directorio y el path del archivo del componente
    const componentsDir = path.join(projectFullPath, 'src', 'components');
    const componentFilePath = path.join(componentsDir, 'TestComponent.tsx');

    // Asegura que el directorio exista
    // fs.mkdirSync con recursive: true es seguro incluso si el directorio ya existe
    fs.mkdirSync(componentsDir, { recursive: true });

    // Si el archivo ya existe, no hacer nada
    if (fs.existsSync(componentFilePath)) {
      console.log(`ℹ️  Archivo ya existe, omitiendo creación: ${componentFilePath}`);
      return;
    }

    // Contenido JSX para el componente de prueba
    const jsxContent = `import React from 'react';
import { Button, Container, Box } from '@mui/material';
// Asegúrate de que este paquete y componente existan y estén correctamente exportados
import { CustomTypography } from "@aguayodevs-utilities/preact-shared";

/**
 * Componente de ejemplo que muestra un mensaje de bienvenida.
 */
export const TestComponent = () => (
  <Container>
    <Box sx={{ textAlign: 'center', my: 4 }}> {/* Usar my para margen vertical */}
      <CustomTypography variant="h4" gutterBottom>
        Bienvenido a ${projectName}
      </CustomTypography>
      <Button variant="contained" color="primary">¡Empezar!</Button>
    </Box>
  </Container>
);
`; // Añadido punto y coma al final

    // Escribir el contenido en el archivo
    fs.writeFileSync(componentFilePath, jsxContent);
    console.log(`✅ Componente de prueba creado: ${componentFilePath}`);

  } catch (error: any) {
    console.error(`❌ Error al crear TestComponent.tsx:`, error.message);
    // Considerar relanzar el error si es crítico
    // throw error;
  }
};