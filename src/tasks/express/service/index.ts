import path from 'node:path';
import fs from 'fs-extra';
import { IcreateService } from '../../../interfaces/Itemplates';
import { ConstructorClass } from './ConstructorClass';
import { MethodClass } from './MethodClass';

/**
 * Crea dinámicamente un controller.
 * ──────────────────────────────────────────────
 *  • Usa plantillas principales en templates/backend/controller
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
    const projectRoot   = process.cwd();
    const genericTokenDir     = path.join(projectRoot, 'src', 'classes', 'generic');
    const httpExceptionDir    = path.join(projectRoot, 'src', 'classes', 'http');
    const servicesDir    = path.join(projectRoot, 'src', 'services', domain);
    const serviceTpl  = path.join(
      projectRoot,
      'framework',
      'frontForge',
      'templates',
      'backend',
      'service',
      'service.ts.tpl',
    );

    /* ───────── paths de archivo ───────── */
    const serviceFilePath = path.join(servicesDir, `${feature}.service.ts`);

    if (fs.existsSync(serviceFilePath)) {
      throw new Error(
        `El servicio "${feature}" ya existe en el dominio "${domain}".`,
      );
    }

    console.info(
      `📂 Creando servicio ${feature} en dominio ${domain} (constructor: ${constructorType})`,
    );

    /* ───────── genera bloques dinámicos ───────── */
    const codeConstructor = new ConstructorClass(
      projectRoot,
      domain,
      feature,
      constructorType,
    ).getCodeConstructor();

    const codeMethod = new MethodClass(feature, domain, methodType).getCodeMethod();

    /* ───────── path relativo para imports ───────── */
    const relativePathGenericToken = (
      path.relative(path.dirname(servicesDir), path.dirname(genericTokenDir)) + path.sep
    )
      .split(path.sep)
      .join('/') /* «../../classes/generic/» */;

    const relativePathHttpException = (
      path.relative(path.dirname(servicesDir), path.dirname(httpExceptionDir)) + path.sep
    )
      .split(path.sep)
      .join('/') /* «../../classes/http/» */;

    /* ───────── inyecta en plantilla ───────── */
    let codeServiceFile = fs
      .readFileSync(serviceTpl, 'utf8')
      .replace(/\${ServiceName}/g, feature)
      .replace(/\${ConstructorCode}/g, codeConstructor)
      .replace(/\${MethodCode}/g, codeMethod)
      .replace(/\${RelativePathGenericToken}/g, relativePathGenericToken.concat('token.ts'))
      .replace(/\${RelativePathHttpException}/g, relativePathHttpException.concat('httpException.ts'));

    /* ───────── guarda archivo ───────── */
    fs.ensureDirSync(servicesDir);
    fs.writeFileSync(serviceFilePath, codeServiceFile);
    console.log('✅ Service generado:', serviceFilePath);
  } catch (error) {
    console.error('❌ Error al generar service:', error);
  }
};
