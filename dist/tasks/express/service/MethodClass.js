"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodClass = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class MethodClass {
    constructor(feature, domain, methodType) {
        this.feature = feature;
        this.domain = domain;
        this.methodBasePath = path_1.default.join(process.cwd(), 'framework', 'frontForge', 'templates', 'backend', 'service', 'methods');
        this.methodType = 'front';
        if (methodType)
            this.methodType = methodType;
    }
    getCodeMethod() {
        let codeMethod = fs_1.default.readFileSync(path_1.default.join(this.methodBasePath, `${this.methodType}.tpl`), 'utf8');
        //console.log("WTF is codeMethod",codeMethod);
        switch (this.methodType) {
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
exports.MethodClass = MethodClass;
