const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'templates');
const destDir = path.join(__dirname, '..', 'dist', 'templates');

async function copyTemplates() {
  try {
    await fs.emptyDir(destDir); // Opcional: limpiar directorio destino antes de copiar
    await fs.copy(sourceDir, destDir);
    console.log('Templates copied successfully using fs-extra!');
  } catch (err) {
    console.error('Error copying templates with fs-extra:', err);
    process.exit(1);
  }
}

copyTemplates();