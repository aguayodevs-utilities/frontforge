#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const createFrontend_1 = require("./features/createFrontend");
const buildAll_1 = require("./features/buildAll");
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .command('create <path> [port]', 'Genera micro-frontend', (y) => y
    .positional('path', {
    describe: 'dominio/feature (ej. admin/reports)',
    type: 'string',
    demandOption: true
})
    .option('port', { alias: 'p', type: 'number', default: 5173 }), (argv) => {
    const parts = argv.path.split('/');
    if (parts.length < 2) {
        console.error('❌  Formato requerido: dominio/feature (ej. admin/reports)');
        process.exit(1);
    }
    const featureName = parts.pop();
    const domainPath = parts.join('/');
    console.log("createFrontend With:", { domainPath, featureName, argv });
    (0, createFrontend_1.createFrontend)(domainPath, featureName, argv);
})
    .command('build', 'Compila todos', () => { }, buildAll_1.buildAll)
    .demandCommand(1)
    .strict()
    .help()
    .parse();
