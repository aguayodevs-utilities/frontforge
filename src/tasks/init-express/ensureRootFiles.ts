import path from 'node:path';
import fs from 'fs-extra';

// Definiciones de BASE_PACKAGE_JSON, BASE_TSCONFIG_JSON, etc. (sin cambios)
const BASE_PACKAGE_JSON = {
  name: "mi-backend-frontforge", 
  version: "0.1.0",
  description: "Backend inicializado con frontforge",
  main: "dist/index.js",
  scripts: {
    start: "node dist/index.js",
    build: "tsc",
    dev: "cross-env NODE_ENV=local nodemon src/index.ts",
    lint: "eslint src/**/*.ts",
    format: "eslint src/**/*.ts --fix"
  },
  keywords: ["express", "frontforge", "backend"],
  author: "", 
  license: "ISC", 
  dependencies: {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2"
  },
  devDependencies: {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node": "^20.14.11",
    "@types/express-session": "^1.17.13",
    "@typescript-eslint/eslint-plugin": "^7.16.1",
    "@typescript-eslint/parser": "^7.16.1",
    "cross-env": "^7.0.3",
    "eslint": "^8.57.0",
    "nodemon": "^3.1.4",
    "ts-node": "^10.9.2",
    "typescript": "^5.5.3"
  }
};

const BASE_TSCONFIG_JSON = {
  "compilerOptions": {
    "target": "ES2016",
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
};

const BASE_GITIGNORE_CONTENT = `node_modules
dist
.env
*.log
.frontforge/
`; // Añadido .frontforge/

const BASE_ENV_CONTENT = `PORT=3000
JWT_SECRET=TU_SECRETO_JWT_AQUI_CAMBIAME
NODE_ENV=local
# Añade otras variables de entorno aquí (ej. DATABASE_URL)
`;

/**
 * Asegura la existencia de archivos de configuración esenciales en la raíz del proyecto.
 * Crea `package.json`, `tsconfig.json`, `.gitignore` y `.env` con contenido base
 * si no existen previamente en el directorio `projectRoot`.
 * También crea el directorio `.frontforge`.
 *
 * @async
 * @function ensureRootFiles
 * @param {string} projectRoot - La ruta absoluta al directorio raíz del proyecto.
 * @returns {Promise<void>} - Promesa que se resuelve cuando todos los archivos han sido verificados/creados.
 * @throws {Error} - Si ocurre un error durante la escritura de archivos o creación de directorios.
 */
export async function ensureRootFiles(projectRoot: string): Promise<void> {
  console.log('   -> Asegurando archivos y directorios de configuración raíz...');
  try {
    // Crear directorio .frontforge
    const frontforgeDir = path.join(projectRoot, '.frontforge');
    await fs.ensureDir(frontforgeDir);
    console.log(`      ✅ Directorio ${path.basename(frontforgeDir)} asegurado.`);

    // package.json
    const pkgPath = path.join(projectRoot, 'package.json');
    if (!await fs.pathExists(pkgPath)) {
      await fs.writeJson(pkgPath, BASE_PACKAGE_JSON, { spaces: 2 });
      console.log('      ✅ package.json creado.');
    } else {
      console.log('      ℹ️  package.json ya existe.');
    }

    // tsconfig.json
    const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
    if (!await fs.pathExists(tsconfigPath)) {
      await fs.writeJson(tsconfigPath, BASE_TSCONFIG_JSON, { spaces: 2 });
      console.log('      ✅ tsconfig.json creado.');
    } else {
      console.log('      ℹ️  tsconfig.json ya existe.');
    }

    // .gitignore
    const gitignorePath = path.join(projectRoot, '.gitignore');
    if (!await fs.pathExists(gitignorePath)) {
      await fs.writeFile(gitignorePath, BASE_GITIGNORE_CONTENT);
      console.log('      ✅ .gitignore creado.');
    } else {
      // Si existe, asegurar que .frontforge/ esté presente
      let content = await fs.readFile(gitignorePath, 'utf-8');
      if (!content.includes('.frontforge/')) {
        content += '\n.frontforge/\n';
        await fs.writeFile(gitignorePath, content);
        console.log('      📝 .frontforge/ añadido a .gitignore existente.');
      } else {
        console.log('      ℹ️  .gitignore ya existe y contiene .frontforge/.');
      }
    }

    // .env (ejemplo)
    const envPath = path.join(projectRoot, '.env');
    if (!await fs.pathExists(envPath)) {
      await fs.writeFile(envPath, BASE_ENV_CONTENT);
      console.log('      ✅ .env de ejemplo creado (¡configúralo!).');
    } else {
      console.log('      ℹ️  .env ya existe.');
    }

    console.log('   ✅ Archivos y directorios de configuración raíz asegurados.');
  } catch (error: any) {
    console.error(`   ❌ Error al asegurar archivos raíz en ${projectRoot}:`, error.message);
    throw error; 
  }
}