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
exports.templateCopier = templateCopier;
const fs_extra_1 = __importDefault(require("fs-extra"));
/**
 * Copia todo el contenido de `srcRoot` dentro de `destRoot`
 * conservando la jerarquía de carpetas.
 */
function templateCopier(srcRoot, destRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('✨ templateCopier desde:', srcRoot, '->', destRoot);
        if (!(yield fs_extra_1.default.pathExists(srcRoot))) {
            console.warn('⚠️  templateCopier: no existe', srcRoot);
            return;
        }
        yield fs_extra_1.default.copy(srcRoot, destRoot);
        console.log('📄 Plantilla copiada de', srcRoot, '->', destRoot);
    });
}
