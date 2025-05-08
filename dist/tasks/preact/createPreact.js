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
exports.createPreact = createPreact;
const commandRunner_1 = require("../../utils/commandRunner");
function createPreact(_a) {
    return __awaiter(this, arguments, void 0, function* ({ projectFullPath, useRouter, }) {
        // 1. Scaffold del proyecto
        console.log('🏗️  Generando template Preact… en:', projectFullPath);
        yield (0, commandRunner_1.commandRunner)('npm', ['init', 'preact@latest', projectFullPath], { cwd: process.cwd() });
        // 2. Instalación básica
        console.log('📦  Instalando dependencias base…');
        yield (0, commandRunner_1.commandRunner)('npm', ['install'], { cwd: projectFullPath });
        // 3. Dev-dependencies
        console.log('📦  Instalando dependencias dev base…');
        yield (0, commandRunner_1.commandRunner)('npm', ['install', '--save-dev', '@types/node', 'cross-env'], { cwd: projectFullPath });
        // 4. Dependencias de runtime
        const baseDeps = [
            'dotenv',
            '@emotion/react',
            '@emotion/styled',
            '@mui/icons-material',
            '@mui/material',
            'axios',
        ];
        yield (0, commandRunner_1.commandRunner)('npm', ['install', ...baseDeps], { cwd: projectFullPath });
        // 5. Router opcional
        if (useRouter) {
            yield (0, commandRunner_1.commandRunner)('npm', ['install', 'wouter'], { cwd: projectFullPath });
        }
    });
}
