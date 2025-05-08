import fs from 'fs';
import path from 'path';
import { TmethodTypeService } from '../../../interfaces/Itemplates';

export class MethodClass {
    private methodBasePath: string;
    private methodType: TmethodTypeService = 'front';
    private projectRoot: string = process.cwd(); // Necesario para calcular serviceFilePath

    constructor(private feature: string, private domain: string, methodType?: TmethodTypeService) {
        // Ajustar ruta methodBasePath para producción y desarrollo
        this.methodBasePath = path.join(__dirname, '..', '..', '..', 'templates', 'backend', 'service', 'methods');
        if(methodType) this.methodType = methodType;
    }

    public getCodeMethod(): string {
        let codeMethod = fs.readFileSync(path.join(this.methodBasePath, `${this.methodType}.tpl`), 'utf8');

        // Calcular la ruta del archivo de servicio para usarla en ${RoutePath}
        const serviceFilePath = path.join(this.projectRoot, 'src', 'services', this.domain, `${this.feature}.service.ts`);
        // Normalizar la ruta para que use / en lugar de \ en Windows para el string dentro del código
        const routePathForError = serviceFilePath.split(path.sep).join('/');

        switch(this.methodType){
            case 'front':
                // ${ServiceName} ya no se usa en el template, se usa get()
                // ${Domain} y ${FrontName} se usan para construir la ruta al index.html
                codeMethod = codeMethod
                    .replace(/\${Domain}/g, this.domain)
                    .replace(/\${FrontName}/g, this.feature)
                    .replace(/\${RoutePath}/g, routePathForError); // Reemplazar RoutePath

                break;
        }
        return codeMethod;
    }
}
