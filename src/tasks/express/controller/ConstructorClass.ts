import path from 'node:path';
import fs from 'fs-extra';
import { TconstructorTypeController } from '../../../interfaces/Itemplates';

/**
 * Clase responsable de generar el fragmento de código correspondiente
 * al constructor de un controlador Express, basado en un tipo especificado.
 * Lee una plantilla de constructor y realiza reemplazos dinámicos.
 */
export class ConstructorClass {
  /**
   * Ruta base donde se encuentran las plantillas (.tpl) para los diferentes
   * tipos de constructores de controladores.
   * @private
   * @type {string}
   */
  private constructorBasePath: string;

  /**
   * Crea una instancia de ConstructorClass.
   * Determina la ruta a las plantillas de constructor basándose en si se ejecuta
   * en entorno de desarrollo (desde `src`) o producción (desde `dist`).
   *
   * @constructor
   * @param {string} projectRoot - Ruta raíz del proyecto donde se genera el código (usado para calcular rutas relativas de destino).
   * @param {string} domain - Dominio al que pertenece el controlador.
   * @param {string} feature - Nombre de la característica (camelCase).
   * @param {TconstructorTypeController} [constructorType='byRole'] - El tipo de constructor a generar.
   */
  constructor(
    private projectRoot: string,
    private domain: string,
    private feature: string,
    private constructorType: TconstructorTypeController = 'byRole',
  ) {
    // Determina la ruta base a las plantillas de constructor
    // __dirname en producción: .../node_modules/@aguayodevs-utilities/frontforge/dist/tasks/express/controller
    // __dirname en desarrollo: .../frontforge/src/tasks/express/controller
    // Sube 3 niveles para llegar a la raíz del paquete (dist/ o src/) y luego a templates
    this.constructorBasePath = path.join(__dirname, '..', '..', '..', 'templates', 'backend', 'controller', 'constructors');
  }

  /**
   * Genera y devuelve el código fuente del constructor del controlador.
   * Lee la plantilla correspondiente al `constructorType`, realiza los reemplazos
   * necesarios (ej. rutas relativas, nombres) y retorna el código como string.
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
      case 'byRole': {
        // Calcula la ruta absoluta al archivo del controlador que se está generando
        const controllerAbsPath = path.join(
          this.projectRoot,
          'src',
          'controllers',
          this.domain,
          `${this.feature}.controller.ts`,
        );

        // Calcula la ruta relativa desde el directorio del controlador actual
        // hasta el directorio que contiene otros controladores del mismo dominio.
        // (Actualmente parece calcular la ruta al mismo directorio, resultando en '.')
        // TODO: Revisar si este cálculo de relativePathController es el deseado.
        const relativePathController = path
          .relative(
            path.dirname(controllerAbsPath), // Directorio del controlador actual
            path.join(this.projectRoot, 'src', 'controllers', this.domain), // Directorio de controladores del dominio
          )
          .split(path.sep)
          .join('/') || '.'; // Asegura que sea '.' si está en el mismo directorio

        // Extrae el rol de la última parte del dominio (ej. 'admin' de 'admin/test')
        const sessionRole = this.domain.split('/').pop() || 'admin'; // Usa 'admin' como fallback

        // Realiza los reemplazos en la plantilla del constructor 'byRole'
        codeConstructor = codeConstructor
          .replace(/\${RelativePathController}/g, relativePathController) // Reemplaza placeholder de ruta relativa
          .replace(/\${ControllerFileName}/g, `${this.feature}.controller`) // Reemplaza placeholder de nombre de archivo (sin .ts)
          .replace(/\${SessionRole}/g, sessionRole); // Reemplaza placeholder del rol esperado
        break;
      }
      // Añadir 'case' para otros tipos de constructores si se implementan
    }

    return codeConstructor; // Devuelve el código del constructor procesado
  }
}
