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
exports.configureVite = configureVite;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function configureVite(_a) {
    return __awaiter(this, arguments, void 0, function* ({ projectFullPath }) {
        const vite = path_1.default.join(projectFullPath, 'vite.config.ts');
        if (!fs_1.default.existsSync(vite))
            return;
        const root = process.cwd();
        const sub = path_1.default.relative(path_1.default.join(root, 'fronts'), projectFullPath).split(path_1.default.sep).join('/');
        const base = `/${sub}`;
        const out_dir = path_1.default.join(root, 'public', sub);
        const out = path_1.default.relative(projectFullPath, out_dir).split(path_1.default.sep).join('/');
        /*
        console.log('---------------framework-----------------');
        console.log('root', root);
        console.log('sub', sub);
        console.log('base', base);
        console.log('out', out);
        console.log('out_dir', out_dir);
        console.log('projectFullPath', projectFullPath);
        console.log('---------------framework-----------------');
        */
        let src = fs_1.default.readFileSync(vite, 'utf8');
        src = src.replace('__BASE_PATH__', base).replace('__OUT_DIR__', out);
        fs_1.default.writeFileSync(vite, src);
        console.log('✅  vite.config.ts configurado');
    });
}
