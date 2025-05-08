import path from 'node:path';
import fs from 'fs-extra';
import { TconstructorTypeController } from '../../../interfaces/Itemplates';

export class ConstructorClass {
  /* carpeta donde viven los templates de constructor */
  private constructorBasePath: string;

  constructor(
    private projectRoot: string, // projectRoot ya no se usa para determinar la ruta de templates
    private domain: string,
    private feature: string,
    private constructorType: TconstructorTypeController = 'byRole',
  ) {
    // Ajustar ruta constructorBasePath para producción y desarrollo
    // __dirname en producción: .../node_modules/@aguayodevs-utilities/frontforge/dist/tasks/express/controller
    // __dirname en desarrollo: .../frontforge/src/tasks/express/controller
    // En ambos casos, necesitamos subir 3 niveles para llegar a la raíz del paquete (dist/ o src/) y luego a templates
    this.constructorBasePath = path.join(__dirname, '..', '..', '..', 'templates', 'backend', 'controller', 'constructors');
  }

  public getCodeConstructor(): string {
    // Lee el template correspondiente
    let codeConstructor = fs.readFileSync(
      path.join(this.constructorBasePath, `${this.constructorType}.tpl`),
      'utf8',
    );

    /* reemplazos dinámicos */
    switch (this.constructorType) {
      case 'byRole': {
        const controllerAbsPath = path.join(
          this.projectRoot, // projectRoot se usa aquí para la ruta del archivo de destino
          'src',
          'controllers',
          this.domain,
          `${this.feature}.controller.ts`,
        );

        const relativePathController = path
          .relative(
            path.dirname(controllerAbsPath),
            path.join(this.projectRoot, 'src', 'controllers', this.domain),
          )
          .split(path.sep)
          .join('/'); // «.»

        codeConstructor = codeConstructor
          .replace(/\${RelativePathController}/g, relativePathController)
          .replace(/\${ControllerFileName}/g, `${this.feature}.controller`) // sin .ts extra
          .replace(/\${SessionRole}/g, this.domain.split('/').pop() || 'admin');
        break;
      }
    }

    return codeConstructor;
  }
}
