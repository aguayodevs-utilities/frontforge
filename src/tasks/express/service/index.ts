import path from 'node:path';
import fs from 'fs-extra';
import { IcreateService } from '../../../interfaces/Itemplates';
import { ConstructorClass } from './ConstructorClass';
import { MethodClass } from './MethodClass';

/**
 * Crea dinámicamente un servicio.
 * ──────────────────────────────────────────────
 *  • Usa plantillas principales en templates/backend/service
 *  • Inserta constructor y métodos generados según el tipo
 */
export const createService = ({
  domain,
  feature,
  constructorType = 'default',
  methodType = 'front',
}: IcreateService): void => {
  try {
    /* ───────── directorios de trabajo ───────── */
    const projectRoot   = process.cwd(); // Usado para la ruta de destino del archivo
    const servicesDir    = path.join(projectRoot, 'src', 'services', domain);

    let serviceTpl: string;
    serviceTpl = path.join(__dirname, '..', '..', '..', 'templates', 'backend', 'service', 'service.ts.tpl');
    console.log(`[DEBUG] Service TPL Path: ${serviceTpl}`);

    /* ───────── paths de archivo ───────── */
    const serviceFilePath = path.join(servicesDir, `${feature}.service.ts`);
    console.log(`[DEBUG] Service File Path: ${serviceFilePath}`);

    if (fs.existsSync(serviceFilePath)) {
      throw new Error(
        `El servicio "${feature}" ya existe en el dominio "${domain}".`,
      );
    }

    /* ───────── generar código de constructor y métodos ───────── */
    console.log(`[DEBUG] Creando ConstructorClass para servicio con projectRoot: ${projectRoot}, domain: ${domain}, feature: ${feature}, constructorType: ${constructorType}`);
    const constructorInstance = new ConstructorClass(projectRoot, domain, feature, constructorType);
    const codeConstructor     = constructorInstance.getCodeConstructor();
    console.log(`[DEBUG] codeConstructor (servicio):\n${codeConstructor}`);

    console.log(`[DEBUG] Creando MethodClass para servicio con feature: ${feature}, domain: ${domain}, methodType: ${methodType}`);
    const methodInstance      = new MethodClass(feature, domain, methodType);
    const codeMethod          = methodInstance.getCodeMethod();
    console.log(`[DEBUG] codeMethod (servicio):\n${codeMethod}`);

    /* Leer, reemplazar y escribir el template del servicio */
    console.log(`[DEBUG] Leyendo serviceTpl desde: ${serviceTpl}`);
    let serviceContent = fs.readFileSync(serviceTpl, 'utf8');
    console.log(`[DEBUG] Contenido original de serviceTpl:\n${serviceContent}`);

    // Calcular rutas relativas
    const genericTokenPath = path.join(projectRoot, 'src', 'classes', 'generic', 'GenericToken'); // Sin .ts para import
    const httpExceptionPath = path.join(projectRoot, 'src', 'classes', 'http', 'HttpException'); // Sin .ts para import
    console.log(`[DEBUG] genericTokenPath (servicio): ${genericTokenPath}`);
    console.log(`[DEBUG] httpExceptionPath (servicio): ${httpExceptionPath}`);

    const relativePathGenericToken = path.relative(path.dirname(serviceFilePath), genericTokenPath).split(path.sep).join('/');
    const relativePathHttpException = path.relative(path.dirname(serviceFilePath), httpExceptionPath).split(path.sep).join('/');
    const serviceName = `${feature.charAt(0).toUpperCase() + feature.slice(1)}Service`;
    console.log(`[DEBUG] serviceName: ${serviceName}`);
    console.log(`[DEBUG] relativePathGenericToken (servicio): ${relativePathGenericToken}`);
    console.log(`[DEBUG] relativePathHttpException (servicio): ${relativePathHttpException}`);


    serviceContent = serviceContent
      .replace(/\/\* \${Constructor} \*\//g, codeConstructor);
    console.log(`[DEBUG] Contenido servicio después de reemplazar Constructor:\n${serviceContent}`);

    serviceContent = serviceContent
      .replace(/\/\* \${Methods} \*\//g, codeMethod);
    console.log(`[DEBUG] Contenido servicio después de reemplazar Methods:\n${serviceContent}`);

    serviceContent = serviceContent
      .replace(/\${ServiceName}/g, serviceName);
    console.log(`[DEBUG] Contenido servicio después de reemplazar ServiceName:\n${serviceContent}`);

    serviceContent = serviceContent
      .replace(/\${RelativePathGenericToken}/g, relativePathGenericToken);
    console.log(`[DEBUG] Contenido servicio después de reemplazar RelativePathGenericToken:\n${serviceContent}`);

    serviceContent = serviceContent
      .replace(/\${RelativePathHttpException}/g, relativePathHttpException);
    console.log(`[DEBUG] Contenido final del servicio antes de escribir:\n${serviceContent}`);

    fs.ensureDirSync(servicesDir);
    fs.writeFileSync(serviceFilePath, serviceContent);
    console.log(`✅ Service generado: ${serviceFilePath}`);

  } catch (error: any) {
    console.error('❌ Error al generar service:', error);
  }
};
