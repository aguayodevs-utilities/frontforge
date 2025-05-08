"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyBackendStubs = copyBackendStubs;
const node_path_1 = __importDefault(require("node:path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
/** Copia controller / service y actualiza router del dominio. */
function copyBackendStubs(_a) {
    return __awaiter(this, arguments, void 0, function* ({ domain, names }) {
        const repo = process.cwd();
        const tplDir = node_path_1.default.join(__dirname, '..', '..', 'templates', 'backend');
        /* controller */
        yield copyTpl(node_path_1.default.join(tplDir, 'controller.ts.tpl'), node_path_1.default.join(repo, 'src', 'controllers', domain, `${names.camel}.controller.ts`), domain, names);
        /* service */
        yield copyTpl(node_path_1.default.join(tplDir, 'service.ts.tpl'), node_path_1.default.join(repo, 'src', 'services', domain, `${names.camel}.service.ts`), domain, names);
        /* router */
        yield ensureRouter(domain, names.camel, names.pascal);
    });
}
function copyTpl(src, dest, domain, n) {
    return __awaiter(this, void 0, void 0, function* () {
        let code = yield fs_extra_1.default.readFile(src, 'utf8');
        code = code.replace(/\${domain}/g, domain)
            .replace(/\${feature}/g, n.camel)
            .replace(/\${FeaturePascal}/g, n.pascal);
        yield fs_extra_1.default.ensureDir(node_path_1.default.dirname(dest));
        yield fs_extra_1.default.writeFile(dest, code, { flag: 'wx' });
    });
}
function ensureRouter(domain, feature, pascal) {
    return __awaiter(this, void 0, void 0, function* () {
        const repo = process.cwd();
        const routerPath = node_path_1.default.join(repo, 'src', 'routes', domain, `route.${domain}.ts`);
        yield fs_extra_1.default.ensureDir(node_path_1.default.dirname(routerPath));
        const routeLine = `router${pascalCase(domain)}.get('/${feature}', ${feature}Controller.list);\n`;
        if (!(yield fs_extra_1.default.pathExists(routerPath))) {
            yield fs_extra_1.default.writeFile(routerPath, `import { Router } from 'express';
import { ${feature}Controller } from '../../controllers/${domain}/${feature}.controller';

export const router${pascalCase(domain)} = Router();

${routeLine}`);
        }
        else {
            const src = yield fs_extra_1.default.readFile(routerPath, 'utf8');
            if (!src.includes(routeLine.trim()))
                yield fs_extra_1.default.appendFile(routerPath, routeLine);
        }
    });
}
function pascalCase(str) {
    return str[0].toUpperCase() + str.slice(1);
}
