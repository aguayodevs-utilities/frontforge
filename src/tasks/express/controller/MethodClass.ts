import fs from 'fs';
import path from 'path';
import { TmethodTypeController } from '../../../interfaces/Itemplates';

export class MethodClass {
    private methodBasePath: string = path.join(process.cwd(), 'framework', 'frontForge', 'templates', 'backend', 'controller', 'methods');
    private methodType: TmethodTypeController = 'front';
    constructor(private feature: string) { }
    public getCodeMethod(): string {
        let codeMethod = fs.readFileSync(path.join(this.methodBasePath, `${this.methodType}.tpl`), 'utf8');
        //console.log("WTF is codeMethod",codeMethod);
        switch(this.methodType){
            case 'front':
                codeMethod = codeMethod.replace(/\${FeatureCamel}/g, this.feature);
                //console.log("WTF is replaced", {codeMethod, methodType: this.methodType});
                break;
        }
        return codeMethod;
    }
}
