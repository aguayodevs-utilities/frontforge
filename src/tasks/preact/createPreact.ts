import { commandRunner } from '../../utils/commandRunner';
import fs from 'fs';
import path from 'node:path';
interface CreatePreactOptions {
  projectFullPath: string;
  useRouter: boolean;
}

export async function createPreact({
  projectFullPath,
  useRouter,
}: CreatePreactOptions): Promise<void> {
  // 1. Scaffold del proyecto
  console.log('🏗️  Generando template Preact… en:', projectFullPath);
  await commandRunner(
    'npm',
    ['init', 'preact@latest', projectFullPath],
    { cwd: process.cwd() }
  );
  // 2. Instalación básica
  console.log('📦  Instalando dependencias base…');
  await commandRunner('npm', ['install'], { cwd: projectFullPath });

  // 3. Dev-dependencies
  console.log('📦  Instalando dependencias dev base…');
  await commandRunner(
    'npm',
    ['install', '--save-dev', '@types/node', 'cross-env'],
    { cwd: projectFullPath }
  );

  // 4. Dependencias de runtime
  const baseDeps = [
    'dotenv',
    '@emotion/react',
    '@emotion/styled',
    '@mui/icons-material',
    '@mui/material',
    'axios',
  ];
  await commandRunner('npm', ['install', ...baseDeps], { cwd: projectFullPath });

  // 5. Router opcional
  if (useRouter) {
    await commandRunner('npm', ['install', 'wouter'], { cwd: projectFullPath });
  }
}
