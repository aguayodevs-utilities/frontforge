import fs from 'fs';
import path from 'path';
export async function createTestComponent({ projectFullPath, projectName }: { projectFullPath: string, projectName: string }) {
  const dir = path.join(projectFullPath, 'src', 'components');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'TestComponent.tsx');
  if (fs.existsSync(file)) return;
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
  fs.writeFileSync(file, jsx);
  console.log('✅  TestComponent.tsx creado');
};