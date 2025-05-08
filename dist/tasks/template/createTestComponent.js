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
exports.createTestComponent = createTestComponent;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function createTestComponent(_a) {
    return __awaiter(this, arguments, void 0, function* ({ projectFullPath, projectName }) {
        const dir = path_1.default.join(projectFullPath, 'src', 'components');
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
        const file = path_1.default.join(dir, 'TestComponent.tsx');
        if (fs_1.default.existsSync(file))
            return;
        const jsx = `import React from 'react';
import { Button, Container, Box } from '@mui/material';
import { CustomTypography } from "@aguayodevs-utilities/preact-shared";
export const TestComponent = () => (
  <Container>
    <Box sx={{ textAlign: 'center', m: 4 }}>
      <CustomTypography variant="h4" gutterBottom>Bienvenido a ${projectName}</CustomTypography>
      <Button variant="contained" color="primary">¡Empezar!</Button>
    </Box>
  </Container>
);`;
        fs_1.default.writeFileSync(file, jsx);
        console.log('✅  TestComponent.tsx creado');
    });
}
;
