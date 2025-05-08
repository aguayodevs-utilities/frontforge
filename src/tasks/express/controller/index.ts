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
    const projectRoot   = process.cwd(); // Usado para la ruta de destino del archivo
    const controllersDir = path.join(projectRoot, 'src', 'controllers', domain);

    let controllerTpl: string;
    controllerTpl = path.join(__dirname, '..', '..', '..', 'templates', 'backend', 'controller', 'controller.ts.tpl');

    /* ───────── paths de archivo ───────── */
    const controllerFilePath = path.join(controllersDir, `${feature}.controller.ts`);

    if (fs.existsSync(controllerFilePath)) {
      throw new Error(
        `El controlador "${feature}" ya existe en el dominio "${domain}".`,
      );
    }

    /* ───────── generar código de constructor y métodos ───────── */
    const constructorInstance = new ConstructorClass(projectRoot, domain, feature, constructorType);
    const codeConstructor     = constructorInstance.getCodeConstructor();
    const methodInstance      = new MethodClass(feature);
    const codeMethod          = methodInstance.getCodeMethod();

    /* Leer, reemplazar y escribir el template del controller */
    let controllerContent = fs.readFileSync(controllerTpl, 'utf8');

    // Calcular rutas relativas
    const genericTokenPath = path.join(projectRoot, 'src', 'classes', 'generic', 'GenericToken'); // Sin .ts para import
    const servicePath = path.join(projectRoot, 'src', 'services', domain, `${feature}.service`); // Sin .ts para import

    const relativePathGenericToken = path.relative(path.dirname(controllerFilePath), genericTokenPath).split(path.sep).join('/');
    const relativePathService = path.relative(path.dirname(controllerFilePath), servicePath).split(path.sep).join('/');

    // Corregir los placeholders buscados (sin /* */)
    controllerContent = controllerContent
      .replace(/\${ControllerConstructor}/g, codeConstructor) // Corregido
      .replace(/\${ControllerMethod}/g, codeMethod)       // Corregido
      .replace(/\${FeatureCamel}/g, feature)
      .replace(/\${RelativePathGenericToken}/g, relativePathGenericToken)
      .replace(/\${RelativePathService}/g, relativePathService);

    fs.ensureDirSync(controllersDir);
    fs.writeFileSync(controllerFilePath, controllerContent);
    console.log(`✅ Controller generado: ${controllerFilePath}`);

  } catch (error: any) {
    console.error('❌ Error al generar controller:', error);
  }
};
