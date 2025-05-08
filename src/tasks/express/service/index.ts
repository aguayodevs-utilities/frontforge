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
    // const genericTokenDir     = path.join(projectRoot, 'src', 'classes', 'generic'); // No se usa
    // const httpExceptionDir    = path.join(projectRoot, 'src', 'classes', 'http'); // No se usa

    let serviceTpl: string;
    // Ajustar ruta serviceTpl para producción y desarrollo
    // __dirname en producción: .../node_modules/@aguayodevs-utilities/frontforge/dist/tasks/express/service
    // __dirname en desarrollo: .../frontforge/src/tasks/express/service
    // En ambos casos, necesitamos subir 3 niveles para llegar a la raíz del paquete (dist/ o src/) y luego a templates
    serviceTpl = path.join(__dirname, '..', '..', '..', 'templates', 'backend', 'service', 'service.ts.tpl');

    /* ───────── paths de archivo ───────── */
    const serviceFilePath = path.join(servicesDir, `${feature}.service.ts`);

    if (fs.existsSync(serviceFilePath)) {
      throw new Error(
        `El servicio "${feature}" ya existe en el dominio "${domain}".`,
      );
    }

    /* ───────── generar código de constructor y métodos ───────── */
    const constructorInstance = new ConstructorClass(projectRoot, domain, feature, constructorType);
    const codeConstructor     = constructorInstance.getCodeConstructor();
    const methodInstance      = new MethodClass(feature, domain, methodType);
    const codeMethod          = methodInstance.getCodeMethod();

    /* Leer, reemplazar y escribir el template del servicio */
    let serviceContent = fs.readFileSync(serviceTpl, 'utf8');
    serviceContent = serviceContent
      .replace('/* ${Constructor} */', codeConstructor)
      .replace('/* ${Methods} */', codeMethod);

    fs.ensureDirSync(servicesDir);
    fs.writeFileSync(serviceFilePath, serviceContent);
    console.log(`✅ Service generado: ${serviceFilePath}`);

  } catch (error: any) {
    console.error('❌ Error al generar service:', error);
  }
};
