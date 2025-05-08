import path from 'node:path';
import fs from 'fs-extra';
import { TconstructorTypeService } from '../../../interfaces/Itemplates';

/**
 * Clase responsable de generar el fragmento de código correspondiente
 * al constructor de un servicio Express, basado en un tipo especificado.
 * Lee una plantilla de constructor y realiza reemplazos dinámicos si son necesarios.
 */
export class ConstructorClass {
  /**
   * Ruta base donde se encuentran las plantillas (.tpl) para los diferentes
   * tipos de constructores de servicios.
   * @private
   * @type {string}
   */
  private constructorBasePath: string;

  /**
   * Crea una instancia de ConstructorClass para servicios.
   * Determina la ruta a las plantillas de constructor basándose en si se ejecuta
   * en entorno de desarrollo (desde `src`) o producción (desde `dist`).
   *
   * @constructor
   * @param {string} projectRoot - Ruta raíz del proyecto donde se genera el código (actualmente no usado para determinar la ruta de templates).
   * @param {string} domain - Dominio al que pertenece el servicio (actualmente no usado en el constructor 'default').
   * @param {string} feature - Nombre de la característica (camelCase) (actualmente no usado en el constructor 'default').
   * @param {TconstructorTypeService} [constructorType='default'] - El tipo de constructor a generar.
   */
  constructor(
    private projectRoot: string,
    private domain: string,
    private feature: string,
    private constructorType: TconstructorTypeService = 'default',
  ) {
    // Determina la ruta base a las plantillas de constructor
    // __dirname en producción: .../node_modules/@aguayodevs-utilities/frontforge/dist/tasks/express/service
    // __dirname en desarrollo: .../frontforge/src/tasks/express/service
    // Sube 3 niveles para llegar a la raíz del paquete (dist/ o src/) y luego a templates
    this.constructorBasePath = path.join(__dirname, '..', '..', '..', 'templates', 'backend', 'service', 'constructors');
  }

  /**
   * Genera y devuelve el código fuente del constructor del servicio.
   * Lee la plantilla correspondiente al `constructorType`. Actualmente, para el tipo 'default',
   * no se realizan reemplazos dinámicos.
   *
   * @public
   * @method getCodeConstructor
   * @returns {string} El código fuente del constructor generado.
   * @throws {Error} Si no se puede leer el archivo de plantilla.
   */
  public getCodeConstructor(): string {
    // Lee el template correspondiente al tipo de constructor
    const templatePath = path.join(this.constructorBasePath, `${this.constructorType}.tpl`);
    let codeConstructor = fs.readFileSync(templatePath, 'utf8');

    // Realiza reemplazos dinámicos específicos para cada tipo de constructor
    switch (this.constructorType) {
      case 'default': {
        // No se requieren reemplazos específicos para el constructor 'default' actualmente.
        // El template 'default.tpl' ya contiene el código necesario.
        break;
      }
      // Añadir 'case' para otros tipos de constructores si se implementan
    }

    return codeConstructor; // Devuelve el código del constructor procesado
  }
}
