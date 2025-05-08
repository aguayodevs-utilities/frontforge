"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createController = void 0;
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
const createController = ({ domain, feature, constructorType = 'byRole', methodType = 'front', }) => {
    try {
        /* ───────── directorios de trabajo ───────── */
        const projectRoot = process.cwd();
        const controllersDir = node_path_1.default.join(projectRoot, 'src', 'controllers', domain);
        const genericTokenDir = node_path_1.default.join(projectRoot, 'src', 'classes', 'generic');
        const servicesDir = node_path_1.default.join(projectRoot, 'src', 'services', domain);
        console.log("WTF is going", { projectRoot, controllersDir, genericTokenDir, servicesDir });
        const controllerTpl = node_path_1.default.join(projectRoot, 'framework', 'frontForge', 'templates', 'backend', 'controller', 'controller.ts.tpl');
        /* ───────── paths de archivo ───────── */
        const controllerFilePath = node_path_1.default.join(controllersDir, `${feature}.controller.ts`);
        if (fs_extra_1.default.existsSync(controllerFilePath)) {
            throw new Error(`El controlador "${feature}" ya existe en el dominio "${domain}".`);
        }
        console.info(`📂 Creando controlador ${feature} en dominio ${domain} (constructor: ${constructorType})`);
        /* ───────── genera bloques dinámicos ───────── */
        const codeConstructor = new ConstructorClass_1.ConstructorClass(projectRoot, domain, feature, constructorType).getCodeConstructor();
        const codeMethod = new MethodClass_1.MethodClass(feature).getCodeMethod();
        /* ───────── path relativo para imports ───────── */
        const relativePathGenericToken = (node_path_1.default.relative(node_path_1.default.dirname(controllersDir), node_path_1.default.dirname(genericTokenDir)) + node_path_1.default.sep)
            .split(node_path_1.default.sep)
            .join('/') /* «../../classes/generic/» */;
        const relativePathService = (node_path_1.default.relative(node_path_1.default.dirname(controllersDir), node_path_1.default.dirname(servicesDir)) + node_path_1.default.sep)
            .split(node_path_1.default.sep)
            .join('/') /* «../../services/» */;
        /* ───────── inyecta en plantilla ───────── */
        let codeControllerFile = fs_extra_1.default
            .readFileSync(controllerTpl, 'utf8')
            .replace(/\${ControllerConstructor}/g, codeConstructor)
            .replace(/\${ControllerMethod}/g, codeMethod)
            .replace(/\${FeatureCamel}/g, feature)
            .replace(/\${RelativePathGenericToken}/g, relativePathGenericToken.concat('token.ts'))
            .replace(/\${RelativePathService}/g, relativePathService.concat(`${feature}Service.ts`));
        /* ───────── guarda archivo ───────── */
        fs_extra_1.default.ensureDirSync(controllersDir);
        fs_extra_1.default.writeFileSync(controllerFilePath, codeControllerFile);
        console.log('✅ Controller generado:', controllerFilePath);
    }
    catch (error) {
        console.error('❌ Error al generar controller:', error);
    }
};
exports.createController = createController;
