import fs from 'fs';
import path from 'path';
import { TmethodTypeService } from '../../../interfaces/Itemplates';

/**
 * Clase responsable de generar el fragmento de código correspondiente
 * a un método específico de un servicio Express, basado en un tipo.
 * Lee una plantilla de método y realiza reemplazos dinámicos.
 */
export class MethodClass {
    /**
     * Ruta base donde se encuentran las plantillas (.tpl) para los diferentes
     * tipos de métodos de servicios.
     * @private
     * @type {string}
     */
    private methodBasePath: string;

    /**
     * El tipo de método a generar (ej. 'front').
     * @private
     * @type {TmethodTypeService}
     */
    private methodType: TmethodTypeService = 'front';

    /**
     * Ruta raíz del proyecto donde se ejecuta el comando npx.
     * Se utiliza para calcular la ruta absoluta del archivo de servicio generado.
     * @private
     * @type {string}
     */
    private projectRoot: string = process.cwd();

    /**
     * Crea una instancia de MethodClass para servicios.
     * Determina la ruta a las plantillas de método y almacena los parámetros necesarios.
     *
     * @constructor
     * @param {string} feature - Nombre de la característica (camelCase), usado para reemplazos.
     * @param {string} domain - Dominio al que pertenece el servicio, usado para reemplazos.
     * @param {TmethodTypeService} [methodType='front'] - El tipo de método a generar.
     */
    constructor(private feature: string, private domain: string, methodType?: TmethodTypeService) {
        // Determina la ruta base a las plantillas de método
        this.methodBasePath = path.join(__dirname, '..', '..', '..', 'templates', 'backend', 'service', 'methods');
        if(methodType) this.methodType = methodType;
    }

    /**
     * Genera y devuelve el código fuente de un método del servicio.
     * Lee la plantilla correspondiente al `methodType`, realiza los reemplazos
     * necesarios (ej. dominio, feature, ruta del archivo) y retorna el código como string.
     *
     * @public
     * @method getCodeMethod
     * @returns {string} El código fuente del método generado.
     * @throws {Error} Si no se puede leer el archivo de plantilla.
     */
    public getCodeMethod(): string {
        // Lee el template correspondiente al tipo de método
        const templatePath = path.join(this.methodBasePath, `${this.methodType}.tpl`);
        let codeMethod = fs.readFileSync(templatePath, 'utf8');

        // Calcula la ruta absoluta del archivo de servicio que se está generando
        // Esta ruta se usa para el placeholder ${RoutePath} dentro del template del método
        const serviceFilePath = path.join(this.projectRoot, 'src', 'services', this.domain, `${this.feature}.service.ts`);
        // Normaliza la ruta para usar '/' como separador, útil para mensajes de error o logs
        const routePathForError = serviceFilePath.split(path.sep).join('/');

        // Realiza reemplazos dinámicos específicos para cada tipo de método
        switch(this.methodType){
            case 'front':
                // Reemplaza placeholders en la plantilla 'front.tpl'
                codeMethod = codeMethod
                    .replace(/\${Domain}/g, this.domain) // Dominio (ej. 'admin/test')
                    .replace(/\${FrontName}/g, this.feature) // Nombre de la feature (ej. 'testFrontend')
                    .replace(/\${RoutePath}/g, routePathForError); // Ruta al archivo de servicio
                break;
            // Añadir 'case' para otros tipos de métodos si se implementan
        }
        return codeMethod; // Devuelve el código del método procesado
    }
}
