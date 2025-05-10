const fs = require('fs-extra');
const path = require('path');

// Resuelve las rutas absolutas
const baseDir = path.resolve(__dirname, '..'); // Resuelve a la raíz del proyecto frontforge
const sourceDir = path.join(baseDir, 'templates');
const destDir = path.join(baseDir, 'dist', 'templates');

console.log(`[copy-templates] Script ejecutándose desde: ${__dirname}`);
console.log(`[copy-templates] Directorio base del proyecto (frontforge): ${baseDir}`);
console.log(`[copy-templates] Directorio de origen de plantillas: ${sourceDir}`);
console.log(`[copy-templates] Directorio de destino de plantillas: ${destDir}`);

async function copyTemplates() {
  try {
    // Asegurar que el directorio de origen exista
    const sourceExists = await fs.pathExists(sourceDir);
    if (!sourceExists) {
      console.error(`[copy-templates] Error: El directorio de origen no existe: ${sourceDir}`);
      process.exit(1);
    }
    console.log(`[copy-templates] El directorio de origen ${sourceDir} existe.`);

    // Asegurar que el directorio de destino exista, si no, crearlo
    await fs.ensureDir(destDir);
    console.log(`[copy-templates] El directorio de destino ${destDir} está asegurado (creado si no existía).`);

    // Opcional: limpiar directorio destino antes de copiar
    // await fs.emptyDir(destDir);
    // console.log(`[copy-templates] Directorio de destino ${destDir} vaciado.`);

    // Copiar los archivos
    console.log(`[copy-templates] Iniciando copia de ${sourceDir} a ${destDir}...`);
    await fs.copy(sourceDir, destDir, { overwrite: true }); // Añadido overwrite: true por si acaso
    console.log('[copy-templates] ¡Plantillas copiadas exitosamente con fs-extra!');
  } catch (err) {
    console.error('[copy-templates] Error copiando plantillas con fs-extra:', err);
    process.exit(1);
  }
}

copyTemplates();