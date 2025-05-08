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
    console.log(`[DEBUG] Controller TPL Path: ${controllerTpl}`);

    /* ───────── paths de archivo ───────── */
    const controllerFilePath = path.join(controllersDir, `${feature}.controller.ts`);
    console.log(`[DEBUG] Controller File Path: ${controllerFilePath}`);

    if (fs.existsSync(controllerFilePath)) {
      throw new Error(
        `El controlador "${feature}" ya existe en el dominio "${domain}".`,
      );
    }

    /* ───────── generar código de constructor y métodos ───────── */
    console.log(`[DEBUG] Creando ConstructorClass con projectRoot: ${projectRoot}, domain: ${domain}, feature: ${feature}, constructorType: ${constructorType}`);
    const constructorInstance = new ConstructorClass(projectRoot, domain, feature, constructorType);
    const codeConstructor     = constructorInstance.getCodeConstructor();
    console.log(`[DEBUG] codeConstructor:\n${codeConstructor}`);

    console.log(`[DEBUG] Creando MethodClass con feature: ${feature}`);
    const methodInstance      = new MethodClass(feature);
    const codeMethod          = methodInstance.getCodeMethod();
    console.log(`[DEBUG] codeMethod:\n${codeMethod}`);

    /* Leer, reemplazar y escribir el template del controller */
    console.log(`[DEBUG] Leyendo controllerTpl desde: ${controllerTpl}`);
    let controllerContent = fs.readFileSync(controllerTpl, 'utf8');
    console.log(`[DEBUG] Contenido original de controllerTpl:\n${controllerContent}`);

    // Calcular rutas relativas
    const genericTokenPath = path.join(projectRoot, 'src', 'classes', 'generic', 'GenericToken'); // Sin .ts para import
    const servicePath = path.join(projectRoot, 'src', 'services', domain, `${feature}.service`); // Sin .ts para import
    console.log(`[DEBUG] genericTokenPath: ${genericTokenPath}`);
    console.log(`[DEBUG] servicePath: ${servicePath}`);

    const relativePathGenericToken = path.relative(path.dirname(controllerFilePath), genericTokenPath).split(path.sep).join('/');
    const relativePathService = path.relative(path.dirname(controllerFilePath), servicePath).split(path.sep).join('/');
    console.log(`[DEBUG] feature: ${feature}`);
    console.log(`[DEBUG] relativePathGenericToken: ${relativePathGenericToken}`);
    console.log(`[DEBUG] relativePathService: ${relativePathService}`);

    controllerContent = controllerContent
      .replace(/\/\* \${Constructor} \*\//g, codeConstructor);
    console.log(`[DEBUG] Contenido después de reemplazar Constructor:\n${controllerContent}`);

    controllerContent = controllerContent
      .replace(/\/\* \${Methods} \*\//g, codeMethod);
    console.log(`[DEBUG] Contenido después de reemplazar Methods:\n${controllerContent}`);

    controllerContent = controllerContent
      .replace(/\${FeatureCamel}/g, feature);
    console.log(`[DEBUG] Contenido después de reemplazar FeatureCamel:\n${controllerContent}`);

    controllerContent = controllerContent
      .replace(/\${RelativePathGenericToken}/g, relativePathGenericToken);
    console.log(`[DEBUG] Contenido después de reemplazar RelativePathGenericToken:\n${controllerContent}`);

    controllerContent = controllerContent
      .replace(/\${RelativePathService}/g, relativePathService);
    console.log(`[DEBUG] Contenido final del controller antes de escribir:\n${controllerContent}`);

    fs.ensureDirSync(controllersDir);
    fs.writeFileSync(controllerFilePath, controllerContent);
    console.log(`✅ Controller generado: ${controllerFilePath}`);

  } catch (error: any) {
    console.error('❌ Error al generar controller:', error);
  }
};
