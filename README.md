# 🚀 frontforge

Herramienta CLI y librería Node.js para **inicializar estructuras de backend**, **generar y compilar micro-frontends** basados en [Preact](https://preactjs.com/) y [Vite](https://vitejs.dev/), junto con **stubs básicos de backend** ([Express](https://expressjs.com/)) dentro de una estructura de monorepositorio predefinida.

Diseñado para acelerar el desarrollo inicial de nuevas características en arquitecturas de micro-frontends acopladas a un backend Express monolítico o modular, con planes de expansión a otros tipos de proyectos.

## ✨ Características

*   **Inicialización de Proyectos**:
    *   Permite seleccionar el tipo de proyecto a inicializar (actualmente soporta Node.js/Express, con planes para Docker y más).
    *   Para Node.js/Express: Crea una estructura de directorios base, incluyendo clases de utilidad (Token, Sanitizer, Validator, HttpException, ErrorHandler), archivos de configuración (`package.json`, `tsconfig.json`, `.env`, `.gitignore`) e instala dependencias básicas.
*   **Generación Rápida de Frontend**: Crea un nuevo micro-frontend Preact con estructura base, configuración de Vite y dependencias esenciales (MUI, Emotion, Axios, dotenv) con un solo comando.
*   **Stubs de Backend (para Express)**: Genera automáticamente archivos básicos de Controlador y Servicio Express asociados al nuevo frontend.
*   **Configuración Automática**:
    *   Configura `vite.config.ts` con las rutas `base` y `outDir` correctas para la integración en el monorepo.
    *   Actualiza `package.json` del frontend con scripts `dev` (con puerto) y `build:dev`.
    *   Registra el nuevo frontend en un archivo central `config/fronts.json`.
    *   (Opcional y frágil) Intenta registrar assets en `src/apps/environment.ts` del backend.
*   **Compilación Centralizada**: Compila todos los micro-frontends registrados en `config/fronts.json` con un solo comando.
*   **Uso Dual**: Funciona como herramienta CLI global/npx o como librería programática en scripts Node.js.

## 📦 Instalación

Puedes usar `frontforge` directamente con `npx` sin instalación global, o instalarlo globalmente si lo prefieres. Está pensado para ejecutarse desde la **raíz de tu monorepositorio** (o en un directorio vacío para el comando `init`).

```bash
# Usar con npx (recomendado)
npx @aguayodevs-utilities/frontforge <comando> [opciones]

# O instalar globalmente (opcional)
npm install -g @aguayodevs-utilities/frontforge
frontforge <comando> [opciones]
```

## ⚙️ Configuración Requerida (para `create` y `build`)

Los comandos `create` y `build` asumen la siguiente estructura de directorios y archivos dentro de tu monorepositorio (el comando `init` ayuda a crear parte de esta estructura cuando se selecciona el tipo de proyecto Node.js/Express):

*   `./fronts/`: Directorio raíz donde se crearán los micro-frontends (ej. `./fronts/admin/miFeature`).
*   `./public/`: Directorio donde Vite compilará los assets de los frontends (ej. `./public/admin/miFeature/assets/...`).
*   `./src/controllers/` (para Express): Directorio donde se crearán los controladores Express.
*   `./src/services/` (para Express): Directorio donde se crearán los servicios Express.
*   `./src/classes/` (para Express): Directorio que contiene clases base como `GenericToken` y `HttpException`.
*   `./src/interfaces/` (para Express): Directorio para interfaces compartidas del backend.
*   `./src/types/` (para Express): Directorio para tipos compartidos del backend.
*   `./config/fronts.json`: Archivo JSON que lista los micro-frontends. `frontforge` lo crea/actualiza al usar `create` y lo lee al usar `build`. Formato esperado:
    ```json
    [
      {
        "name": "nombreEnCamelCase",
        "projectFullPath": "fronts/dominio/nombreEnCamelCase", // Ruta relativa desde la raíz del repo
        "port": 5174
      }
      // ... más entradas
    ]
    ```
*   `./src/apps/environment.ts` (Opcional, para Express): Si existe, la tarea `deployAssets` (parte de `create`) intentará añadir la ruta de assets del nuevo frontend al array `frontPathAssets` dentro de este archivo. **Esta característica es frágil.**

## 🚀 Uso CLI

### 1. Inicializar Proyecto (`init`)

Ejecuta este comando en un **directorio vacío** donde quieras crear la base de tu nuevo proyecto. Se te pedirá que selecciones el tipo de proyecto a inicializar.

```bash
npx @aguayodevs-utilities/frontforge init [--skip-install]
```

Al seleccionar **"Node.js (Express Backend)"**:
*   Crea las carpetas `src/classes`, `src/interfaces`, `src/types`, `src/routes`, `config`, `public`.
*   Genera archivos base para Express: `GenericToken`, `GenericSanitizer`, `GenericValidator`, `HttpException`, `HttpErrorHandler`, `interface.server.ts`, `generic.types.ts`, `src/index.ts`.
*   Crea `package.json`, `tsconfig.json`, `.gitignore`, `.env` (ejemplo) si no existen.
*   Instala dependencias (`express`, `dotenv`, `cors`, `jsonwebtoken`, etc.) a menos que se use `--skip-install`.

(Próximamente se añadirán más tipos de proyectos, como Docker).

### 2. Crear un Micro-Frontend (`create`)

Genera un nuevo micro-frontend Preact y sus stubs de backend asociados (si aplica para el tipo de proyecto inicializado, ej. Express). Ejecútalo desde la raíz del monorepo.

```bash
npx @aguayodevs-utilities/frontforge create <dominio>/<feature> [--port <numero>]
```

*   `<dominio>/<feature>`: Ruta que define la ubicación y nombre. (Requerido)
    *   Ejemplo: `admin/user-management` creará el frontend en `./fronts/admin/user-management/`.
    *   Si el proyecto base es Express, también creará stubs en `./src/controllers/admin/`, `./src/services/admin/`.
    *   `feature` se convertirá a `camelCase` para nombres de archivo/clase (ej. `userManagement`).
*   `--port <numero>` (o `-p <numero>`): Puerto para el servidor de desarrollo Vite. (Opcional, por defecto: `5173`).

**Ejemplo:**

```bash
npx @aguayodevs-utilities/frontforge create admin/reports --port 3001
```

### 3. Compilar Todos los Micro-Frontends (`build`)

Compila todos los frontends listados en `config/fronts.json` ejecutando `npm run build` en cada uno de sus directorios (`projectFullPath`). Ejecútalo desde la raíz del monorepo.

```bash
npx @aguayodevs-utilities/frontforge build
```

## 🛠️ API Programática

Puedes importar y usar las funciones principales en tus propios scripts Node.js.

```typescript
import { initProject, createFrontend, buildAll } from '@aguayodevs-utilities/frontforge';
import path from 'node:path';
import fs from 'fs-extra';

async function main() {
  const backendRoot = path.resolve('./mi-nuevo-backend'); // Define una ruta para el backend

  try {
    // Crear e inicializar el directorio del backend
    await fs.ensureDir(backendRoot);
    process.chdir(backendRoot); // Cambiar directorio actual para que init funcione aquí
    console.log(`Inicializando proyecto en: ${process.cwd()}`);
    // Para uso programático, initProject actualmente inicializa un backend Express.
    // La selección interactiva es para el uso CLI.
    await initProject({ installDeps: true }); 
    console.log('Proyecto inicializado.');
    process.chdir('..'); // Volver al directorio original (importante)

    // Crear un nuevo frontend dentro del proyecto inicializado
    console.log('Creando frontend...');
    process.chdir(backendRoot);
    await createFrontend('shopping', 'product-detail', { port: 3005 });
    console.log('Frontend creado.');

    // Compilar todos los frontends
    console.log('Compilando todos...');
    await buildAll();
    console.log('Compilación completada.');
    process.chdir('..'); // Volver al directorio original

  } catch (error) {
    console.error('Error en el script:', error);
  }
}

main();
```

## 📁 Estructura del Paquete (`@aguayodevs-utilities/frontforge`)

*   `dist/`: Código compilado (JavaScript CJS + tipos `.d.ts`) y plantillas copiadas. Es lo que se publica en npm.
*   `src/`: Código fuente original en TypeScript.
    *   `features/`: Lógica principal para los comandos (`initProject`, `createFrontend`, `buildAll`).
    *   `tasks/`: Tareas específicas reutilizables.
        *   `init-express/`: Subtareas para el comando `init` cuando se selecciona Express.
        *   `preact/`: Subtareas relacionadas con la creación/configuración de Preact.
        *   `express/`: Subtareas para generar stubs de backend Express (usadas por `create`).
    *   `interfaces/`: Definiciones de tipos e interfaces TypeScript para `frontforge`.
    *   `utils/`: Funciones de utilidad (ejecutar comandos, normalizar nombres, copiar plantillas).
    *   `cli.ts`: Definición de la interfaz de línea de comandos con `yargs`.
    *   `index.ts`: Punto de entrada para el uso como librería.
*   `templates/`: Plantillas base para los archivos generados.
    *   `backend-init/`: Plantillas para el comando `init` (tipo Express).
    *   `backend/`: Plantillas para los stubs de controlador/servicio (`create` para Express).
    *   `frontend/`: Plantillas para el micro-frontend Preact (`create`).
*   `README.md`: Este archivo.
*   `package.json`: Definición del paquete, dependencias y scripts.
*   `LICENCE`: Licencia ISC.

## 🤝 Contribuciones y Publicación

1.  **Desarrollo**: Realiza cambios en la carpeta `src/`.
2.  **Linting**: Ejecuta `npm run lint` para verificar el estilo del código.
3.  **Testing**: (TODO: Añadir tests) Ejecuta `npm test`.
4.  **Compilación**: Ejecuta `npm run build` para compilar TS a JS en `dist/` y copiar templates.
5.  **Versionado**: Incrementa la versión en `package.json` siguiendo [SemVer](https://semver.org/).
6.  **Commit y Tag**: Haz commit de los cambios y crea una etiqueta git (`git tag vX.Y.Z`).
7.  **Push**: Sube los commits y la etiqueta a GitHub (`git push origin main --tags`).
8.  **Publicación**: Ejecuta `npm run publish-frontforge` (que internamente ejecuta `npm install`, `build` y `npm publish --access=public`).

---

Licencia ISC - Miguel Aguayo