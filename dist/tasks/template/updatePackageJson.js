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
exports.updatePackageJson = updatePackageJson;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function updatePackageJson(_a) {
    return __awaiter(this, arguments, void 0, function* ({ projectFullPath, port }) {
        const pkg = path_1.default.join(projectFullPath, 'package.json');
        if (!fs_1.default.existsSync(pkg))
            return;
        const json = JSON.parse(fs_1.default.readFileSync(pkg, 'utf8'));
        json.scripts = json.scripts || {};
        json.scripts.dev = json.scripts.dev && json.scripts.dev.includes('--port')
            ? json.scripts.dev
            : `${json.scripts.dev || 'vite'} --port ${port}`;
        json.scripts["build:dev"] = json.scripts["build:dev"] || 'cross-env NODE_ENV=development vite build';
        fs_1.default.writeFileSync(pkg, JSON.stringify(json, null, 2));
        console.log('✅  script dev actualizado');
    });
}
;
