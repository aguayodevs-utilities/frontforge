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
exports.deployAssets = deployAssets;
/**
 * Añade automáticamente el nuevo path de assets al arreglo `frontPathAssets`
 * del backend `check-ai-apiux/src/apps/environment.ts`.
 *
 * • Calcula la sub‑ruta que ya se usó para base/outDir en vite.config.ts
 *   (ej.: admin/my-apps/create-app)
 * • Prepara "/<sub‑ruta>/assets"
 * • Inserta si aún no existe en el array.
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function deployAssets(_a) {
    return __awaiter(this, arguments, void 0, function* ({ projectFullPath }) {
        const repoRoot = process.cwd(); // carpeta raíz donde ejecutas el CLI
        const frontsDir = path_1.default.join(repoRoot, 'fronts');
        const subPath = path_1.default
            .relative(frontsDir, projectFullPath) // admin/my-apps/create-app
            .split(path_1.default.sep).join('/'); // normaliza a POSIX
        const assetPath = `/${subPath}/assets`; // /admin/my-apps/create-app/assets
        // Ruta al archivo del backend
        const envFile = path_1.default.join(repoRoot, 'src', 'apps', 'environment.ts');
        if (!fs_1.default.existsSync(envFile)) {
            console.warn('⚠️  environment.ts no encontrado, omitiendo deployAssets');
            return;
        }
        let source = fs_1.default.readFileSync(envFile, 'utf8');
        // Comprueba si ya existe
        if (source.includes(`"${assetPath}"`)) {
            console.log(`ℹ️  ${assetPath} ya estaba registrado en frontPathAssets`);
            return;
        }
        // Inserta antes del corchete de cierre del array frontPathAssets
        source = source.replace(/(export const frontPathAssets:\s*[^\[]*\[\s*)([^]*?)(\s*\])/m, (match, prefix, arrayBody, closing) => `${prefix}${arrayBody.trimEnd()},\n    "${assetPath}"${closing}`);
        fs_1.default.writeFileSync(envFile, source);
        console.log(`✅  Añadido ${assetPath} a frontPathAssets`);
    });
}
;
