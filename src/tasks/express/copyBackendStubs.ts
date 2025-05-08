import path from 'node:path';
import fs from 'fs-extra';
// Usar kebabCase y pascalCase de la librería change-case
import { kebabCase, pascalCase } from 'change-case'; // Corregido: usar kebabCase

/**
 * @interface BackendNames
 * Define los nombres normalizados para una característica de backend.
 * @property {string} camel - Nombre de la característica en camelCase.
 * @property {string} pascal - Nombre de la característica en PascalCase.
 */
interface BackendNames { // Corregido: Definido como interface
  camel: string;
  pascal: string;
}

/**
 * @interface CopyBackendStubsOptions
 * Opciones para la función `copyBackendStubs`.
 * @property {string} domain - Dominio al que pertenecen los stubs.
 * @property {BackendNames} names - Nombres normalizados de la característica.
 */
interface CopyBackendStubsOptions { // Corregido: Definido como interface
  domain: string;
  names: BackendNames;
}

/**
 * Copia plantillas básicas de controlador/servicio y asegura/actualiza el archivo de rutas del dominio.
 *
 * **Nota:** Esta función parece ser una alternativa o versión anterior a `createController` y `createService`.
 * Utiliza plantillas base (`controller.ts.tpl`, `service.ts.tpl`) con reemplazos simples y no inserta
 * lógica de constructores o métodos complejos generados por `ConstructorClass` o `MethodClass`.
 * Considerar si esta función sigue siendo necesaria o si debe ser deprecada/eliminada.
 *
 * @async
 * @function copyBackendStubs
 * @param {CopyBackendStubsOptions} options - Opciones con dominio y nombres.
 * @returns {Promise<void>}
 */
export async function copyBackendStubs(
  {domain, names}: CopyBackendStubsOptions // Usa la interface definida
): Promise<void> {
  console.warn("⚠️  [Aviso] Ejecutando copyBackendStubs. Considerar usar createController/createService para funcionalidad completa.");
  const repo = process.cwd();
  // La ruta a templates debería funcionar en dev y prod si la estructura es correcta
  const tplDir = path.join(__dirname, '..', '..', '..', 'templates', 'backend');

  /* --- Copiar Controller Template --- */
  console.log(`📄 Copiando plantilla de controlador para ${domain}/${names.camel}...`);
  await copyTpl(
    path.join(tplDir, 'controller', 'controller.ts.tpl'), // Template base
    path.join(repo, 'src', 'controllers', domain, `${names.camel}.controller.ts`),
    domain,
    names
  );

  /* --- Copiar Service Template --- */
  console.log(`📄 Copiando plantilla de servicio para ${domain}/${names.camel}...`);
  await copyTpl(
    path.join(tplDir, 'service', 'service.ts.tpl'), // Template base
    path.join(repo, 'src', 'services', domain, `${names.camel}.service.ts`),
    domain,
    names
  );

  /* --- Asegurar/Actualizar Router --- */
  console.log(`🔄 Asegurando/Actualizando router para el dominio ${domain}...`);
  await ensureRouter(domain, names.camel, names.pascal);
  console.log(`✅ Stubs de backend básicos y router actualizados para ${domain}/${names.camel}.`);
}

/**
 * Copia un archivo de plantilla a un destino, realizando reemplazos básicos.
 * @async
 * @function copyTpl
 * @param {string} src - Ruta al archivo de plantilla fuente.
 * @param {string} dest - Ruta al archivo de destino.
 * @param {string} domain - Dominio actual.
 * @param {BackendNames} names - Nombres normalizados (camel y pascal). Usa la interface definida.
 * @returns {Promise<void>}
 * @throws {Error} Si el archivo de destino ya existe (flag 'wx').
 */
async function copyTpl(src: string, dest: string, domain: string, names: BackendNames): Promise<void> { // Usa la interface definida
  try {
    let code = await fs.readFile(src, 'utf8');
    // Realizar reemplazos básicos
    code = code.replace(/\${domain}/g, domain)
               .replace(/\${feature}/g, names.camel) // Asume que ${feature} es camelCase
               .replace(/\${FeaturePascal}/g, names.pascal);
    // Asegurar que el directorio de destino exista
    await fs.ensureDir(path.dirname(dest));
    // Escribir el archivo solo si no existe
    await fs.writeFile(dest, code, { flag: 'wx' });
  } catch (error: any) {
    // Ignorar error si el archivo ya existe (EEXIST), loguear otros errores
    if (error.code !== 'EEXIST') {
      console.error(`❌ Error al copiar plantilla ${src} a ${dest}:`, error);
      throw error; // Re-lanzar otros errores
    } else {
      console.log(`ℹ️  Archivo ya existe, omitiendo copia: ${dest}`);
    }
  }
}

/**
 * Asegura que exista un archivo de router para el dominio especificado y añade la ruta GET para el nuevo feature.
 * Si el archivo existe, solo añade la línea de la ruta si no está presente.
 * @async
 * @function ensureRouter
 * @param {string} domain - Dominio actual (ej. 'admin', 'user/settings').
 * @param {string} feature - Nombre de la característica en camelCase.
 * @param {string} featurePascal - Nombre de la característica en PascalCase.
 * @returns {Promise<void>}
 */
async function ensureRouter(domain: string, feature: string, featurePascal: string): Promise<void> {
  const repo = process.cwd();
  // Asume que los routers están en src/routes/${domain}/route.${domain}.ts
  // Nota: El nombre del archivo de ruta podría necesitar ajuste si el dominio tiene '/'
  const domainFileNamePart = domain.split('/').pop()!; // Usa la última parte del dominio para el nombre del archivo
  const routerPath = path.join(repo, 'src', 'routes', domain, `route.${domainFileNamePart}.ts`);
  await fs.ensureDir(path.dirname(routerPath));

  // Construir nombre del router y controlador en PascalCase
  const routerVariableName = `router${pascalCase(domainFileNamePart)}`;
  const controllerClassName = `${featurePascal}Controller`;
  // Construir ruta relativa desde el router al controlador
  const controllerRelativePath = path.relative(
    path.dirname(routerPath),
    path.join(repo, 'src', 'controllers', domain, `${feature}.controller`) // Sin .ts para import
  ).split(path.sep).join('/');

  // Línea de código para añadir la nueva ruta GET (asume método 'get' en el controlador)
  // TODO: Verificar si el método debería ser 'list' o 'get' según la convención usada.
  //       Actualmente MethodClass genera 'get', no 'list'.
  const routeLine = `${routerVariableName}.get('/${kebabCase(feature)}', ${controllerClassName}.get);\n`; // Corregido: Usa kebabCase para la URL

  if (!(await fs.pathExists(routerPath))) {
    // Crear archivo de router si no existe
    const routerContent = `import { Router } from 'express';
import { ${controllerClassName} } from '${controllerRelativePath}';

export const ${routerVariableName} = Router();

${routeLine}`;
    await fs.writeFile(routerPath, routerContent);
    console.log(`➕ Creado archivo de router: ${routerPath}`);
  } else {
    // Añadir ruta al archivo existente si no está ya incluida
    const currentContent = await fs.readFile(routerPath, 'utf8');
    // Comprobar si la importación del controlador ya existe
    const importStatement = `import { ${controllerClassName} } from '${controllerRelativePath}';`;
    let contentToAppend = '';
    if (!currentContent.includes(importStatement)) {
        contentToAppend += importStatement + '\n'; // Añadir import si falta
    }
    // Comprobar si la línea de la ruta ya existe (ignorando espacios al final)
    if (!currentContent.includes(routeLine.trim())) {
      contentToAppend += routeLine; // Añadir ruta si falta
    }

    if (contentToAppend) {
      await fs.appendFile(routerPath, '\n' + contentToAppend); // Añadir al final con salto de línea previo
      console.log(`➕ Ruta/Importación añadida a: ${routerPath}`);
    } else {
      console.log(`ℹ️  Ruta/Importación ya existe en: ${routerPath}`);
    }
  }
}
