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
exports.commandRunner = commandRunner;
const execa_1 = require("execa");
/**
 * Ejecuta un comando heredando stdout/stderr.
 */
function commandRunner(cmd_1) {
    return __awaiter(this, arguments, void 0, function* (cmd, args = [], options = {} // ⬅️ usa el alias tipado
    ) {
        if (process.platform === 'win32' && cmd === 'npm')
            cmd = 'npm.cmd';
        yield (0, execa_1.execa)(cmd, args, Object.assign({ stdio: 'inherit', shell: true }, options));
    });
}
