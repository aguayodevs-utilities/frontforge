import path from 'node:path';
import fs from 'fs-extra';
import { TconstructorTypeService } from '../../../interfaces/Itemplates';

export class ConstructorClass {
  /* carpeta donde viven los templates de constructor */
  private constructorBasePath: string;

  constructor(
    private projectRoot: string,
    private domain: string,
    private feature: string,
    private constructorType: TconstructorTypeService = 'default',
  ) {
    this.constructorBasePath = path.join(
      this.projectRoot,
      'framework',
      'frontForge',
      'templates',
      'backend',
      'service',
      'constructors',
    );
  }

  public getCodeConstructor(): string {
    // Lee el template correspondiente
    let codeConstructor = fs.readFileSync(
      path.join(this.constructorBasePath, `${this.constructorType}.tpl`),
      'utf8',
    );

    /* reemplazos dinámicos */
    switch (this.constructorType) {
      case 'default': {
        /*
        const controllerAbsPath = path.join(
          this.projectRoot,
          'src',
          'services',
          this.domain,
          `${this.feature}.service.ts`,
        );

        const relativePathService = path
          .relative(
            path.dirname(serviceAbsPath),
            path.join(this.projectRoot, 'src', 'services', this.domain),
          )
          .split(path.sep)
          .join('/'); // «.»

        codeConstructor = codeConstructor
          .replace('${RelativePathService}', relativePathService)
          .replace('${ServiceFileName}', `${this.feature}.service`) // sin .ts extra
          .replace('${SessionRole}', this.domain.split('/').pop() || 'admin');
          */
        break;
      }
    }

    return codeConstructor;
  }
}
