import path from 'node:path';
import fs from 'fs-extra';
import { IcreateController } from '../../../interfaces/Itemplates';
import { ConstructorClass } from './ConstructorClass';
import { MethodClass } from './MethodClass';

/**
 * Genera un archivo de controlador Express completo para una característica específica.
 * Utiliza una plantilla base y la rellena con código generado dinámicamente
 * para el constructor y los métodos, además de calcular las rutas de importación correctas.
 *
 * @function createController
 * @param {IcreateController} options - Opciones para la creación del controlador.
 * @param {string} options.domain - Dominio/ruta al que pertenece el controlador (ej. 'admin/users').
 * @param {string} options.feature - Nombre de la característica en camelCase (ej. 'userProfile').
 * @param {TconstructorTypeController} [options.constructorType='byRole'] - Tipo de constructor a generar.
 * @param {TmethodTypeController} [options.methodType='front'] - Tipo de método principal a generar.
 * @returns {void} - No devuelve valor, escribe el archivo directamente o loguea errores.
 */
export const createController = async ({
  domain,
  feature,
  constructorType = 'byRole',
  methodType = 'front', // Actualmente MethodClass solo soporta 'front'
}: IcreateController): Promise<void> => {
  try {
    // --- 1. Definición de Rutas ---
    const projectRoot   = process.cwd(); // Raíz del proyecto donde se ejecuta el comando npx
    const controllersDir = path.join(projectRoot, 'src', 'controllers', domain); // Directorio de destino
    const controllerFilePath = path.join(controllersDir, `${feature}.controller.ts`); // Archivo de destino
    const controllersConfigPath = path.join(projectRoot, '.frontforge', 'express', 'controllers.json');

    // Ruta a la plantilla base del controlador dentro de este paquete
    const controllerTplPath = path.join(__dirname, '..', '..', '..', 'templates', 'backend', 'controller', 'controller.ts.tpl');

    // --- 2. Validación de Existencia ---
    if (fs.existsSync(controllerFilePath)) {
      // Podría ser un warning en lugar de un error si se desea permitir la sobreescritura o actualización
      console.warn(`⚠️  El controlador "${feature}" ya existe en "${controllersDir}". Omitiendo creación.`);
      return; // Salir si ya existe
    }

    // --- 3. Generación de Código Interno ---
    // Genera el código del constructor usando ConstructorClass
    const constructorInstance = new ConstructorClass(projectRoot, domain, feature, constructorType);
    const codeConstructor     = constructorInstance.getCodeConstructor();

    // Genera el código del método usando MethodClass
    const methodInstance      = new MethodClass(feature); // Pasar methodType si se implementan más tipos
    const codeMethod          = methodInstance.getCodeMethod();

    // --- 4. Lectura y Procesamiento de Plantilla ---
    // Lee el contenido de la plantilla base
    let controllerContent = fs.readFileSync(controllerTplPath, 'utf8');

    // Calcula las rutas relativas necesarias para los imports dentro del controlador generado
    const genericTokenImportPath = path.join(projectRoot, 'src', 'classes', 'generic', 'GenericToken'); // Sin .ts para import
    const serviceImportPath = path.join(projectRoot, 'src', 'services', domain, `${feature}.service`); // Sin .ts para import

    // Calcula la ruta relativa desde el directorio del controlador al GenericToken
    const relativePathGenericToken = path.relative(controllersDir, genericTokenImportPath)
                                       .split(path.sep).join('/'); // Normaliza a /
    // Calcula la ruta relativa desde el directorio del controlador al Servicio asociado
    const relativePathService = path.relative(controllersDir, serviceImportPath)
                                  .split(path.sep).join('/'); // Normaliza a /

    // --- 5. Reemplazo de Placeholders ---
    // Reemplaza todos los placeholders en el contenido de la plantilla
    controllerContent = controllerContent
      .replace(/\${ControllerConstructor}/g, codeConstructor) // Inserta el constructor generado
      .replace(/\${ControllerMethod}/g, codeMethod)       // Inserta los métodos generados
      .replace(/\${FeatureCamel}/g, feature)              // Reemplaza con el nombre de la feature
      .replace(/\${RelativePathGenericToken}/g, relativePathGenericToken) // Reemplaza con la ruta a GenericToken
      .replace(/\${RelativePathService}/g, relativePathService);         // Reemplaza con la ruta al Servicio

    // --- 6. Escritura del Archivo ---
    // Asegura que el directorio de destino exista
    fs.ensureDirSync(controllersDir);
    // Escribe el contenido procesado en el archivo del controlador
    fs.writeFileSync(controllerFilePath, controllerContent);
 
     // --- 7. Escritura del Archivo de Test ---
     console.log(`   -> Generando archivo de test para el controlador...`);
     const controllerTestTplPath = path.join(__dirname, '..', '..', '..', 'templates', 'backend', 'controller', 'controller.test.ts.tpl');
     const controllerTestFilePath = path.join(controllersDir, `${feature}.controller.test.ts`);
 
     if (fs.existsSync(controllerTestFilePath)) {
        console.warn(`   ⚠️  El archivo de test para el controlador "${feature}" ya existe. Omitiendo creación.`);
     } else {
        let controllerTestContent = fs.readFileSync(controllerTestTplPath, 'utf8');
 
        // Realizar reemplazos de placeholders en el archivo de test
        controllerTestContent = controllerTestContent
          .replace(/\${FeatureCamel}/g, feature) // Reemplaza con el nombre de la feature
          .replace(/\${DomainPath}/g, domain); // Reemplaza con la ruta del dominio
 
        fs.writeFileSync(controllerTestFilePath, controllerTestContent);
        console.log(`   ✅ Archivo de test generado: ${controllerTestFilePath}`);
     }
 
     // Leer el archivo de configuración de controladores
     const controllers = await fs.readJson(controllersConfigPath) as any[];

    // Añadir la información del nuevo controlador
    controllers.push({
      domain,
      feature,
      path: controllerFilePath,
    });

    // Escribir la configuración actualizada
    await fs.writeJson(controllersConfigPath, controllers, { spaces: 2 });

    console.log(`✅ Controller generado: ${controllerFilePath}`);

  } catch (error: any) {
    // Manejo de errores durante el proceso
    console.error(`❌ Error al generar el controlador para ${domain}/${feature}:`, error.message);
    // Considerar loguear error.stack para más detalles en depuración
    // console.error(error.stack);
  }
};
