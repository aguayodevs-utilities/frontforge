import fs from 'fs';
import path from 'path';
import { TmethodTypeService } from '../../../interfaces/Itemplates';

export class MethodClass {
    private methodBasePath: string;
    private methodType: TmethodTypeService = 'front';

    constructor(private feature: string, private domain: string, methodType?: TmethodTypeService) {
        // Ajustar ruta methodBasePath para producción y desarrollo
        // __dirname en producción: .../node_modules/@aguayodevs-utilities/frontforge/dist/tasks/express/service
        // __dirname en desarrollo: .../frontforge/src/tasks/express/service
        // En ambos casos, necesitamos subir 3 niveles para llegar a la raíz del paquete (dist/ o src/) y luego a templates
        this.methodBasePath = path.join(__dirname, '..', '..', '..', 'templates', 'backend', 'service', 'methods');
        if(methodType) this.methodType = methodType;
    }

    public getCodeMethod(): string {
        let codeMethod = fs.readFileSync(path.join(this.methodBasePath, `${this.methodType}.tpl`), 'utf8');
        //console.log("WTF is codeMethod",codeMethod);
        switch(this.methodType){
            case 'front':
                codeMethod = codeMethod.replace(/\${ServiceName}/g, `${this.feature}Service`)
                    .replace(/\${Domain}/g, this.domain)
                    .replace(/\${FrontName}/g, this.feature);

                //console.log("WTF is replaced", {codeMethod, methodType: this.methodType});
                break;
        }
        return codeMethod;
    }
}
