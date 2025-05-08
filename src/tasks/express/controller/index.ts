import path from 'node:path';
import fs from 'fs-extra';
import { IcreateController } from '../../../interfaces/Itemplates';
import { ConstructorClass } from './ConstructorClass';
import { MethodClass } from './MethodClass';

/**
 * Crea dinámicamente un controller.
 * ──────────────────────────────────────────────
 *  • Usa plantillas principales en templates/backend/controller
 *  • Inserta constructor y métodos generados según el tipo
 */
export const createController = ({
  domain,
  feature,
  constructorType = 'byRole',
  methodType = 'front',
}: IcreateController): void => {
  try {
    /* ───────── directorios de trabajo ───────── */
    const projectRoot   = process.cwd();
    const controllersDir = path.join(projectRoot, 'src', 'controllers', domain);
    const genericTokenDir     = path.join(projectRoot, 'src', 'classes', 'generic');
    const servicesDir    = path.join(projectRoot, 'src', 'services', domain);
    console.log("WTF is going", {projectRoot, controllersDir, genericTokenDir, servicesDir});
    let controllerTpl: string;
    if (__dirname.includes('dist')) {
      // En producción, __dirname es algo como .../node_modules/@aguayodevs-utilities/frontforge/dist/tasks/express/controller
      // Necesitamos subir 3 niveles para llegar a .../node_modules/@aguayodevs-utilities/frontforge/dist/
      // Y luego ir a templates/backend/controller/controller.ts.tpl
      controllerTpl = path.join(__dirname, '..', '..', '..', 'templates', 'backend', 'controller', 'controller.ts.tpl');
    } else {
      // En desarrollo, __dirname es algo como .../frontforge/src/tasks/express/controller
      // projectRoot es .../frontforge
      // La ruta original era projectRoot + framework/frontForge/templates... lo cual es incorrecto.
      // Debería ser relativa a __dirname o usar una ruta absoluta al proyecto si es necesario.
      // Por ahora, asumimos que en desarrollo la estructura es src/templates
       controllerTpl = path.join(projectRoot, 'templates', 'backend', 'controller', 'controller.ts.tpl');
    }

    /* ───────── paths de archivo ───────── */
    const controllerFilePath = path.join(controllersDir, `${feature}.controller.ts`);

    if (fs.existsSync(controllerFilePath)) {
      throw new Error(
        `El controlador "${feature}" ya existe en el dominio "${domain}".`,
      );
    }

    console.info(
      `📂 Creando controlador ${feature} en dominio ${domain} (constructor: ${constructorType})`,
    );

    /* ───────── genera bloques dinámicos ───────── */
    const codeConstructor = new ConstructorClass(
      projectRoot,
      domain,
      feature,
      constructorType,
    ).getCodeConstructor();

    const codeMethod = new MethodClass(feature).getCodeMethod();

    /* ───────── path relativo para imports ───────── */
    const relativePathGenericToken = (
      path.relative(path.dirname(controllersDir), path.dirname(genericTokenDir)) + path.sep
    )
      .split(path.sep)
      .join('/') /* «../../classes/generic/» */;

    const relativePathService = (
      path.relative(path.dirname(controllersDir), path.dirname(servicesDir)) + path.sep
    )
      .split(path.sep)
      .join('/') /* «../../services/» */;

    /* ───────── inyecta en plantilla ───────── */
    let codeControllerFile = fs
      .readFileSync(controllerTpl, 'utf8')
      .replace(/\${ControllerConstructor}/g, codeConstructor)
      .replace(/\${ControllerMethod}/g, codeMethod)
      .replace(/\${FeatureCamel}/g, feature)
      .replace(/\${RelativePathGenericToken}/g, relativePathGenericToken.concat('token.ts'))
      .replace(/\${RelativePathService}/g, relativePathService.concat(`${feature}Service.ts`));

    /* ───────── guarda archivo ───────── */
    fs.ensureDirSync(controllersDir);
    fs.writeFileSync(controllerFilePath, codeControllerFile);
    console.log('✅ Controller generado:', controllerFilePath);
  } catch (error) {
    console.error('❌ Error al generar controller:', error);
  }
};
