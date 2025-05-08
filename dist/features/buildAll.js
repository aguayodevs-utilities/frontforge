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
exports.buildAll = buildAll;
const node_path_1 = __importDefault(require("node:path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const execa_1 = require("execa");
/**
 * Recorre config/fronts.json y ejecuta `npm run build`
 * en cada micro-frontend listado.
 * Acepta entradas con:
 *   • path:  relativo a 'fronts/'
 *   • projectFullPath: ruta absoluta o relativa a repoRoot
 */
function buildAll() {
    return __awaiter(this, void 0, void 0, function* () {
        const repoRoot = process.cwd();
        const fronts = yield fs_extra_1.default.readJson(node_path_1.default.join(repoRoot, 'config', 'fronts.json'));
        for (const f of fronts) {
            const dir = f.projectFullPath
                ? node_path_1.default.resolve(repoRoot, f.projectFullPath)
                : node_path_1.default.join(repoRoot, 'fronts', f.path);
            if (!(yield fs_extra_1.default.pathExists(dir))) {
                console.warn('⚠️  Skipping, directory not found:', dir);
                continue;
            }
            console.log('🔨 Building', node_path_1.default.relative(repoRoot, dir));
            yield (0, execa_1.execa)('npm', ['run', 'build'], { cwd: dir, stdio: 'inherit' });
        }
    });
}
