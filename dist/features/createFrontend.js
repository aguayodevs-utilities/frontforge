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
exports.createFrontend = createFrontend;
const node_path_1 = __importDefault(require("node:path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const normalize_1 = require("../utils/normalize");
const commandRunner_1 = require("../utils/commandRunner");
const templateCopier_1 = require("../utils/templateCopier");
/* import { copyBackendStubs }     from '../tasks/backend/copyBackendStubs'; */
const configureVite_1 = require("../tasks/preact/configureVite");
const createPreact_1 = require("../tasks/preact/createPreact");
const createTestComponent_1 = require("../tasks/template/createTestComponent");
const deployAssets_1 = require("../tasks/template/deployAssets");
const updateFrontsJson_1 = require("../tasks/template/updateFrontsJson");
const updateIndexFile_1 = require("../tasks/template/updateIndexFile");
const updatePackageJson_1 = require("../tasks/template/updatePackageJson");
const updateShared_1 = require("../tasks/template/updateShared");
const updateStylesFile_1 = require("../tasks/template/updateStylesFile");
const controller_1 = require("../tasks/express/controller");
const service_1 = require("../tasks/express/service");
function createFrontend(domain, feature, argv) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Ejecutando createPreact con:", { domain, feature });
        const names = (0, normalize_1.normalize)(feature); // { camel, pascal }
        const repo = process.cwd();
        const parentFrontDir = node_path_1.default.join(repo, 'fronts', domain);
        const projectName = names.camel;
        const projectFullPath = node_path_1.default.join(parentFrontDir, projectName);
        const port = argv.port || 5173;
        const useRouter = argv.router ? true : false;
        console.log('🔍  Carpeta padre:', parentFrontDir);
        console.log('🔍  Carpeta proyecto:', projectFullPath);
        /** 1️⃣ Preact */
        yield (0, createPreact_1.createPreact)({ projectFullPath, useRouter });
        /* 1️⃣ Copiar plantilla base */
        const templatesDir = node_path_1.default.resolve(__dirname, '..', '..', 'templates', 'frontend');
        const fallbackTemplatesDir = node_path_1.default.resolve(__dirname, '..', '..', '..', 'templates', 'frontend');
        console.log({ templatesDir, fallbackTemplatesDir });
        const srcTemplates = fs_extra_1.default.existsSync(templatesDir) ? templatesDir : fallbackTemplatesDir;
        console.log("ejecutando templateCopier con:", {
            srcTemplates,
            projectFullPath
        });
        yield (0, templateCopier_1.templateCopier)(srcTemplates, projectFullPath);
        /* 2️⃣ Ajustar vite.config.ts */
        yield (0, configureVite_1.configureVite)({ projectFullPath });
        /* 4️⃣ Tareas sobre el front */
        yield (0, createTestComponent_1.createTestComponent)({ projectFullPath, projectName });
        yield (0, updateIndexFile_1.updateIndexFile)({ projectFullPath });
        yield (0, updateStylesFile_1.updateStylesFile)({ projectFullPath });
        yield (0, updatePackageJson_1.updatePackageJson)({ projectFullPath, port });
        yield (0, updateShared_1.updateShared)({
            projectFullPath,
            runCommand: (cmd, args, opts = {}) => (0, commandRunner_1.commandRunner)(cmd, args, Object.assign(Object.assign({}, opts), { cwd: projectFullPath }))
        });
        yield (0, deployAssets_1.deployAssets)({ projectFullPath });
        /* 5️⃣ Registrar en fronts.json */
        yield (0, updateFrontsJson_1.updateFrontsJson)({
            projectFullPath,
            projectName,
            port
        });
        /* 6️⃣ Instalar dependencias */
        console.log('📦  npm install …');
        yield (0, commandRunner_1.commandRunner)('npm', ['install'], { cwd: projectFullPath });
        yield (0, commandRunner_1.commandRunner)('npm', ['run', 'build:dev'], { cwd: projectFullPath });
        /* 3️⃣ Backend stubs */
        yield (0, controller_1.createController)({ domain, feature: names.camel });
        yield (0, service_1.createService)({ domain, feature: names.camel });
        console.log(`✅  Micro-frontend /${domain}/${names.camel} generado`);
    });
}
