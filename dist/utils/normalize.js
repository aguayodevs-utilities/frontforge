"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalize = void 0;
const change_case_1 = require("change-case");
const normalize = (name) => ({
    raw: name,
    camel: (0, change_case_1.camelCase)(name),
    pascal: (0, change_case_1.pascalCase)(name)
});
exports.normalize = normalize;
