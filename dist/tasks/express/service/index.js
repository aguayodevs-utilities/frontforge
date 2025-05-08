"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createService = void 0;
const node_path_1 = __importDefault(require("node:path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const ConstructorClass_1 = require("./ConstructorClass");
const MethodClass_1 = require("./MethodClass");
/**
 * Crea dinámicamente un controller.
 * ──────────────────────────────────────────────
 *  • Usa plantillas principales en templates/backend/controller
 *  • Inserta constructor y métodos generados según el tipo
 */
const createService = ({ domain, feature, constructorType = 'default', methodType = 'front', }) => {
    try {
        /* ───────── directorios de trabajo ───────── */
        const projectRoot = process.cwd();
        const genericTokenDir = node_path_1.default.join(projectRoot, 'src', 'classes', 'generic');
        const httpExceptionDir = node_path_1.default.join(projectRoot, 'src', 'classes', 'http');
        const servicesDir = node_path_1.default.join(projectRoot, 'src', 'services', domain);
        const serviceTpl = node_path_1.default.join(projectRoot, 'framework', 'frontForge', 'templates', 'backend', 'service', 'service.ts.tpl');
        /* ───────── paths de archivo ───────── */
        const serviceFilePath = node_path_1.default.join(servicesDir, `${feature}.service.ts`);
        if (fs_extra_1.default.existsSync(serviceFilePath)) {
            throw new Error(`El servicio "${feature}" ya existe en el dominio "${domain}".`);
        }
        console.info(`📂 Creando servicio ${feature} en dominio ${domain} (constructor: ${constructorType})`);
        /* ───────── genera bloques dinámicos ───────── */
        const codeConstructor = new ConstructorClass_1.ConstructorClass(projectRoot, domain, feature, constructorType).getCodeConstructor();
        const codeMethod = new MethodClass_1.MethodClass(feature, domain, methodType).getCodeMethod();
        /* ───────── path relativo para imports ───────── */
        const relativePathGenericToken = (node_path_1.default.relative(node_path_1.default.dirname(servicesDir), node_path_1.default.dirname(genericTokenDir)) + node_path_1.default.sep)
            .split(node_path_1.default.sep)
            .join('/') /* «../../classes/generic/» */;
        const relativePathHttpException = (node_path_1.default.relative(node_path_1.default.dirname(servicesDir), node_path_1.default.dirname(httpExceptionDir)) + node_path_1.default.sep)
            .split(node_path_1.default.sep)
            .join('/') /* «../../classes/http/» */;
        /* ───────── inyecta en plantilla ───────── */
        let codeServiceFile = fs_extra_1.default
            .readFileSync(serviceTpl, 'utf8')
            .replace(/\${ServiceName}/g, feature)
            .replace(/\${ConstructorCode}/g, codeConstructor)
            .replace(/\${MethodCode}/g, codeMethod)
            .replace(/\${RelativePathGenericToken}/g, relativePathGenericToken.concat('token.ts'))
            .replace(/\${RelativePathHttpException}/g, relativePathHttpException.concat('httpException.ts'));
        /* ───────── guarda archivo ───────── */
        fs_extra_1.default.ensureDirSync(servicesDir);
        fs_extra_1.default.writeFileSync(serviceFilePath, codeServiceFile);
        console.log('✅ Service generado:', serviceFilePath);
    }
    catch (error) {
        console.error('❌ Error al generar service:', error);
    }
};
exports.createService = createService;
