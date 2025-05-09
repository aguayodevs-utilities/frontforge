import path from 'node:path';
import fs from 'fs-extra';

const CONFIG_DIR_NAME = '.frontforge';
const FRONTS_CONFIG_FILE_NAME = 'frontForgeFronts.json';
const NGINX_TEMPLATE_FILE = 'default.conf.tpl';
const NGINX_OUTPUT_FILE = 'default.conf';
const FRONTEND_LOCATIONS_PLACEHOLDER = '##FRONTEND_LOCATIONS##';

interface FrontConfigEntry {
  name: string;
  projectFullPath: string; // e.g., fronts/main/dashboard
  port?: number; // No usado directamente por Nginx, pero parte de la estructura
}

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
 * Genera y copia la configuración de Nginx al proyecto del usuario,
 * creando dinámicamente los bloques de location para cada micro-frontend.
 *
 * @async
 * @function copyNginxConfig
 * @param {CopyNginxConfigOptions} options - Opciones de copia.
 * @returns {Promise<void>}
 */
export async function copyNginxConfig({ projectRoot, nginxConfigDir = 'nginx' }: CopyNginxConfigOptions): Promise<void> {
  const templateSourceDir = path.join(__dirname, '..', '..', 'templates', 'docker');
  const nginxTemplatePath = path.join(templateSourceDir, NGINX_TEMPLATE_FILE);
  
  const destinationNginxDir = path.join(projectRoot, nginxConfigDir);
  const destinationNginxConfPath = path.join(destinationNginxDir, NGINX_OUTPUT_FILE);

  const frontsConfigPath = path.join(projectRoot, CONFIG_DIR_NAME, FRONTS_CONFIG_FILE_NAME);

  console.log(`   -> Generando y copiando configuración de Nginx a ${destinationNginxConfPath}...`);

  try {
    await fs.ensureDir(destinationNginxDir);

    if (!await fs.pathExists(nginxTemplatePath)) {
      throw new Error(`Plantilla de Nginx no encontrada en: ${nginxTemplatePath}`);
    }
    const templateContent = await fs.readFile(nginxTemplatePath, 'utf-8');
    
    let frontendLocations = '';
    if (await fs.pathExists(frontsConfigPath)) {
      const frontsArray: FrontConfigEntry[] = await fs.readJson(frontsConfigPath);
      if (Array.isArray(frontsArray)) {
        frontsArray.forEach(front => {
          // projectFullPath es algo como "fronts/main/dashboard"
          // Necesitamos la parte después de "fronts/" para la URL base, ej. "/main/dashboard/"
          // Y la ruta completa para el alias en el sistema de archivos de Nginx (asumiendo que public/ es la raíz)
          const urlBasePath = front.projectFullPath.startsWith('fronts/') 
                              ? front.projectFullPath.substring('fronts'.length) 
                              : `/${front.projectFullPath}`; // Asegurar slash inicial
          
          const aliasPath = front.projectFullPath; // Esta será la ruta relativa a la raíz de Nginx /usr/share/nginx/html/

          frontendLocations += `
    location ${urlBasePath}/ {
        alias /usr/share/nginx/html/${aliasPath}/;
        try_files $uri $uri/ ${urlBasePath}/index.html;
    }
`;
        });
      }
    } else {
      console.log(`      ℹ️  Archivo ${FRONTS_CONFIG_FILE_NAME} no encontrado. No se generarán locations específicos para frontends.`);
    }

    const finalNginxConfig = templateContent.replace(FRONTEND_LOCATIONS_PLACEHOLDER, frontendLocations.trim());
    await fs.writeFile(destinationNginxConfPath, finalNginxConfig);
    
    console.log(`      ✅ Configuración de Nginx generada y copiada a ${destinationNginxConfPath}`);

  } catch (error: any) {
    console.error(`   ❌ Error al generar o copiar configuración de Nginx a ${destinationNginxDir}:`, error.message);
    throw error;
  }
}