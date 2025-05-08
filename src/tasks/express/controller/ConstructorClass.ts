import path from 'node:path';
import fs from 'fs-extra';
import { TconstructorTypeController } from '../../../interfaces/Itemplates';

export class ConstructorClass {
  /* carpeta donde viven los templates de constructor */
  private constructorBasePath: string;

  constructor(
    private projectRoot: string,
    private domain: string,
    private feature: string,
    private constructorType: TconstructorTypeController = 'byRole',
  ) {
    // Ajustar ruta constructorBasePath para producción y desarrollo
    if (__dirname.includes('dist')) {
      this.constructorBasePath = path.join(__dirname, '..', '..', '..', 'templates', 'backend', 'controller', 'constructors');
    } else {
      this.constructorBasePath = path.join(this.projectRoot, 'framework', 'frontForge', 'templates', 'backend', 'controller', 'constructors');
    }
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
          this.projectRoot,
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
          .replace('${RelativePathController}', relativePathController)
          .replace('${ControllerFileName}', `${this.feature}.controller`) // sin .ts extra
          .replace('${SessionRole}', this.domain.split('/').pop() || 'admin');
        break;
      }
    }

    return codeConstructor;
  }
}
