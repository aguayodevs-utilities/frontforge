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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShared = updateShared;
/**
 * Instala el paquete compartido `fronts/shared` dentro del micro-frontend.
 *
 * @param projectFullPath Carpeta raíz del micro-frontend.
 * @param runCommand      Función que envuelve `execa` o similar.
 */
function updateShared(_a) {
    return __awaiter(this, arguments, void 0, function* ({ projectFullPath, runCommand }) {
        console.log('📂  Instalando @aguayodevs-utilities/preact-shared');
        yield runCommand('npm', ['install @aguayodevs-utilities/preact-shared'], { cwd: projectFullPath });
    });
}
