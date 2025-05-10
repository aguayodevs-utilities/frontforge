import path from 'node:path';
import fs from 'fs-extra';
import { IcreateService } from '../../../interfaces/Itemplates';
import { ConstructorClass } from './ConstructorClass';
import { MethodClass } from './MethodClass';
import { pascalCase } from 'change-case'; // Usar para generar nombre de servicio

/**
 * Genera un archivo de servicio Express completo para una característica específica.
 * Utiliza una plantilla base y la rellena con código generado dinámicamente
 * para el constructor y los métodos, además de calcular las rutas de importación correctas.
 *
 * @function createService
 * @param {IcreateService} options - Opciones para la creación del servicio.
 * @param {string} options.domain - Dominio/ruta al que pertenece el servicio (ej. 'admin/users').
 * @param {string} options.feature - Nombre de la característica en camelCase (ej. 'userProfile').
 * @param {TconstructorTypeService} [options.constructorType='default'] - Tipo de constructor a generar.
 * @param {TmethodTypeService} [options.methodType='front'] - Tipo de método principal a generar.
 * @returns {void} - No devuelve valor, escribe el archivo directamente o loguea errores.
 */
export const createService = async ({
  domain,
  feature,
  constructorType = 'default',
  methodType = 'front', // Actualmente MethodClass solo soporta 'front'
}: IcreateService): Promise<void> => {
  try {
    // --- 1. Definición de Rutas ---
    const projectRoot   = process.cwd(); // Raíz del proyecto donde se ejecuta el comando npx
    const servicesDir    = path.join(projectRoot, 'src', 'services', domain); // Directorio de destino
    const serviceFilePath = path.join(servicesDir, `${feature}.service.ts`); // Archivo de destino
    const servicesConfigPath = path.join(projectRoot, '.frontforge', 'express', 'services.json');

    // Ruta a la plantilla base del servicio dentro de este paquete
    const serviceTplPath = path.join(__dirname, '..', '..', '..', 'templates', 'backend', 'service', 'service.ts.tpl');

    // --- 2. Validación de Existencia ---
    if (fs.existsSync(serviceFilePath)) {
      console.warn(`⚠️  El servicio "${feature}" ya existe en "${servicesDir}". Omitiendo creación.`);
      return; // Salir si ya existe
      // throw new Error(
      //   `El servicio "${feature}" ya existe en el dominio "${domain}".`,
      // );
    }

    // --- 3. Generación de Código Interno ---
    // Genera el código del constructor usando ConstructorClass
    const constructorInstance = new ConstructorClass(projectRoot, domain, feature, constructorType);
    const codeConstructor     = constructorInstance.getCodeConstructor();

    // Genera el código del método usando MethodClass
    const methodInstance      = new MethodClass(feature, domain, methodType);
    const codeMethod          = methodInstance.getCodeMethod();

    // --- 4. Lectura y Procesamiento de Plantilla ---
    // Lee el contenido de la plantilla base
    let serviceContent = fs.readFileSync(serviceTplPath, 'utf8');

    // Calcula las rutas relativas necesarias para los imports dentro del servicio generado
    const genericTokenImportPath = path.join(projectRoot, 'src', 'classes', 'generic', 'GenericToken'); // Sin .ts para import
    const httpExceptionImportPath = path.join(projectRoot, 'src', 'classes', 'http', 'HttpException'); // Sin .ts para import

    // Calcula la ruta relativa desde el directorio del servicio al GenericToken
    const relativePathGenericToken = path.relative(path.dirname(serviceFilePath), genericTokenImportPath)
                                       .split(path.sep).join('/'); // Normaliza a /
    // Calcula la ruta relativa desde el directorio del servicio a HttpException
    const relativePathHttpException = path.relative(path.dirname(serviceFilePath), httpExceptionImportPath)
                                        .split(path.sep).join('/'); // Normaliza a /

    // Genera el nombre de la clase de servicio en PascalCase (ej. 'UserProfileService')
    const serviceName = `${pascalCase(feature)}Service`;

    // --- 5. Reemplazo de Placeholders ---
    // Reemplaza todos los placeholders en el contenido de la plantilla
    serviceContent = serviceContent
      .replace(/\${ConstructorCode}/g, codeConstructor) // Inserta el constructor generado
      .replace(/\${MethodCode}/g, codeMethod)         // Inserta los métodos generados
      .replace(/\${ServiceName}/g, serviceName)        // Reemplaza con el nombre de la clase de servicio
      .replace(/\${RelativePathGenericToken}/g, relativePathGenericToken) // Reemplaza con la ruta a GenericToken
      .replace(/\${RelativePathHttpException}/g, relativePathHttpException); // Reemplaza con la ruta a HttpException

    // --- 6. Escritura del Archivo ---
    // Asegura que el directorio de destino exista
    fs.ensureDirSync(servicesDir);
    // Escribe el contenido procesado en el archivo del servicio
    fs.writeFileSync(serviceFilePath, serviceContent);

    // Leer el archivo de configuración de servicios
    const services = await fs.readJson(servicesConfigPath) as any[];

    // Añadir la información del nuevo servicio
    services.push({
      domain,
      feature,
      path: serviceFilePath,
    });

    // Escribir la configuración actualizada
    await fs.writeJson(servicesConfigPath, services, { spaces: 2 });

    console.log(`✅ Service generado: ${serviceFilePath}`);

  } catch (error: any) {
    // Manejo de errores durante el proceso
    console.error(`❌ Error al generar el servicio para ${domain}/${feature}:`, error.message);
    // Considerar loguear error.stack para más detalles en depuración
    // console.error(error.stack);
  }
};
