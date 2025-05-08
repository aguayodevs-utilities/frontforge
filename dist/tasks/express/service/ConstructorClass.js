"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstructorClass = void 0;
const node_path_1 = __importDefault(require("node:path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
class ConstructorClass {
    constructor(projectRoot, domain, feature, constructorType = 'default') {
        this.projectRoot = projectRoot;
        this.domain = domain;
        this.feature = feature;
        this.constructorType = constructorType;
        this.constructorBasePath = node_path_1.default.join(this.projectRoot, 'framework', 'frontForge', 'templates', 'backend', 'service', 'constructors');
    }
    getCodeConstructor() {
        // Lee el template correspondiente
        let codeConstructor = fs_extra_1.default.readFileSync(node_path_1.default.join(this.constructorBasePath, `${this.constructorType}.tpl`), 'utf8');
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
exports.ConstructorClass = ConstructorClass;
