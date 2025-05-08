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
exports.updateFrontsJson = updateFrontsJson;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function updateFrontsJson(_a) {
    return __awaiter(this, arguments, void 0, function* ({ projectName, projectFullPath, port }) {
        const fronts = path_1.default.join(process.cwd(), 'fronts.json');
        let arr = [];
        if (fs_1.default.existsSync(fronts)) {
            try {
                arr = JSON.parse(fs_1.default.readFileSync(fronts, 'utf8'));
            }
            catch (_b) {
                arr = [];
            }
        }
        if (!Array.isArray(arr))
            arr = [];
        const rel = path_1.default.relative(process.cwd(), projectFullPath);
        const idx = arr.findIndex((e) => e.name === projectName);
        const entry = { name: projectName, path: rel, port };
        idx >= 0 ? arr.splice(idx, 1, entry) : arr.push(entry);
        fs_1.default.writeFileSync(fronts, JSON.stringify(arr, null, 2));
        console.log('✅  fronts.json actualizado');
    });
}
;
