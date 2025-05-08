import fs from 'fs';
import path from 'path';
import { TmethodTypeController } from '../../../interfaces/Itemplates';

/**
 * Clase responsable de generar el fragmento de código correspondiente
 * a un método específico de un controlador Express, basado en un tipo.
 * Lee una plantilla de método y realiza reemplazos dinámicos.
 */
export class MethodClass {
    /**
     * Ruta base donde se encuentran las plantillas (.tpl) para los diferentes
     * tipos de métodos de controladores.
     * @private
     * @type {string}
     */
    private methodBasePath: string;

    /**
     * El tipo de método a generar (actualmente solo 'front').
     * @private
     * @type {TmethodTypeController}
     */
    private methodType: TmethodTypeController = 'front'; // TODO: Permitir pasar methodType en constructor si se añaden más tipos

    /**
     * Crea una instancia de MethodClass.
     * Determina la ruta a las plantillas de método basándose en si se ejecuta
     * en entorno de desarrollo (desde `src`) o producción (desde `dist`).
     *
     * @constructor
     * @param {string} feature - Nombre de la característica (camelCase), usado para reemplazos.
     */
    constructor(private feature: string) {
        // Determina la ruta base a las plantillas de método
        // __dirname en producción: .../node_modules/@aguayodevs-utilities/frontforge/dist/tasks/express/controller
        // __dirname en desarrollo: .../frontforge/src/tasks/express/controller
        // Sube 3 niveles para llegar a la raíz del paquete (dist/ o src/) y luego a templates
        this.methodBasePath = path.join(__dirname, '..', '..', '..', 'templates', 'backend', 'controller', 'methods');
    }

    /**
     * Genera y devuelve el código fuente de un método del controlador.
     * Lee la plantilla correspondiente al `methodType`, realiza los reemplazos
     * necesarios (ej. nombre de la feature) y retorna el código como string.
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

        // Realiza reemplazos dinámicos específicos para cada tipo de método
        switch(this.methodType){
            case 'front':
                // Reemplaza el placeholder con el nombre de la feature en camelCase
                codeMethod = codeMethod.replace(/\${FeatureCamel}/g, this.feature);
                break;
            // Añadir 'case' para otros tipos de métodos si se implementan
        }
        return codeMethod; // Devuelve el código del método procesado
    }
}
