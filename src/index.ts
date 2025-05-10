/**
 * Punto de entrada principal para el uso de frontforge como librería.
 * Reexporta las funciones clave para la creación y compilación de micro-frontends.
 */

export { createFrontendPreact } from './features/createFrontend'; // Renombrado
export { buildAll } from './features/buildAll';
export { initProject } from './features/initProject';
export { createController } from './tasks/express/controller';
export { createService } from './tasks/express/service';
