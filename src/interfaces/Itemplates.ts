/**
 * @interface Itemplates
 * Interfaz base que define propiedades comunes utilizadas en varias tareas
 * relacionadas con la generación de código y configuración de micro-frontends.
 * Todas las propiedades son opcionales en la base, pero pueden ser requeridas
 * por interfaces específicas que la extiendan.
 *
 * @property {string} [domain] - El dominio o agrupación lógica (ej. 'admin').
 * @property {string} [feature] - El nombre de la característica o micro-frontend (ej. 'reports').
 * @property {string} [projectName] - El nombre normalizado (camelCase) del proyecto/carpeta.
 * @property {boolean} [useRouter] - Indica si se debe incluir configuración de enrutador.
 * @property {number} [port] - El puerto para el servidor de desarrollo.
 */
export interface Itemplates {
  domain?: string;
  feature?: string;
  projectName?: string;
  useRouter?: boolean;
  port?: number;
}

/**
 * Tipos de constructores disponibles para los controladores Express.
 * - 'byRole': Genera un constructor que valida el rol del usuario basado en el dominio.
 * - 'byFeature': (No implementado actualmente) Podría generar un constructor diferente.
 * @typedef {'byRole' | 'byFeature'} TconstructorTypeController
 */
export type TconstructorTypeController = "byRole" | "byFeature";

/**
 * Tipos de constructores disponibles para los servicios Express.
 * - 'default': Genera un constructor básico que recibe req, res, next.
 * @typedef {'default'} TconstructorTypeService
 */
export type TconstructorTypeService = "default";

/**
 * Tipos de métodos disponibles para los controladores Express.
 * - 'front': Genera un método GET para servir el HTML del micro-frontend asociado.
 * @typedef {'front'} TmethodTypeController
 */
export type TmethodTypeController = "front";

/**
 * Tipos de métodos disponibles para los servicios Express.
 * - 'front': Genera un método `get` para obtener la ruta al HTML del micro-frontend.
 * @typedef {'front'} TmethodTypeService
 */
export type TmethodTypeService = "front";

/**
 * @interface IcreateTestComponent
 * Argumentos para la tarea `createTestComponent`.
 * @extends Itemplates
 * @property {string} projectFullPath - Ruta absoluta al directorio del proyecto frontend.
 * @property {string} projectName - Nombre normalizado (camelCase) del proyecto.
 */
export interface IcreateTestComponent extends Itemplates {
  projectFullPath: string;
  projectName: string;
}

/**
 * @interface IcreatePreact
 * Argumentos para la tarea `createPreact`.
 * @extends Itemplates
 * @property {string} projectFullPath - Ruta absoluta al directorio donde se creará el proyecto Preact.
 * @property {boolean} useRouter - Indica si se debe incluir preact-router.
 */
export interface CreatePreactOptions extends Itemplates { // Renombrado para claridad
    projectFullPath: string;
    useRouter: boolean; // Hecho requerido según el error anterior
}


/**
 * @interface IcreateController
 * Argumentos para la tarea `createController`.
 * @extends Itemplates
 * @property {string} domain - Dominio al que pertenece el controlador.
 * @property {string} feature - Nombre de la característica (usado para el nombre del archivo y clase).
 * @property {TconstructorTypeController} [constructorType='byRole'] - Tipo de constructor a generar.
 * @property {string} [middlewareSnakeCase] - (No usado actualmente) Nombre para un posible middleware.
 * @property {TmethodTypeController} [methodType='front'] - Tipo de método a generar.
 */
export interface IcreateController extends Itemplates {
  domain: string;
  feature: string;
  constructorType?: TconstructorTypeController;
  middlewareSnakeCase?: string; // Considerar eliminar si no se usa
  methodType?: TmethodTypeController;
}

/**
 * @interface IcreateService
 * Argumentos para la tarea `createService`.
 * @extends Itemplates
 * @property {string} domain - Dominio al que pertenece el servicio.
 * @property {string} feature - Nombre de la característica (usado para el nombre del archivo y clase).
 * @property {TconstructorTypeService} [constructorType='default'] - Tipo de constructor a generar.
 * @property {TmethodTypeService} [methodType='front'] - Tipo de método a generar.
 */
export interface IcreateService extends Itemplates {
  domain: string;
  feature: string;
  constructorType?: TconstructorTypeService;
  methodType?: TmethodTypeService;
}
