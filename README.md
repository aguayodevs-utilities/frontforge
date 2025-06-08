# 🚀 frontforge

Herramienta CLI y librería Node.js diseñada para **optimizar el desarrollo de micro-frontends** basados en [Preact](https://preactjs.com/) y [Vite](https://vitejs.dev/), facilitando la **inicialización de estructuras de backend** compatibles y la **generación de stubs** para arquitecturas basadas en [Express](https://expressjs.com/). Ideal para entornos de monorepositorio, `frontforge` agiliza la creación y gestión de nuevas características.

## ✨ Características Principales
 
`frontforge` ofrece un conjunto de funcionalidades para agilizar el desarrollo en arquitecturas de micro-frontends y backends Express:
 
*   **Inicialización de Proyectos Backend**: Configura la estructura base para diferentes tipos de proyectos backend, actualmente soportando:
    *   **Node.js (Express)**: Establece una estructura de directorios estándar, incluye clases de utilidad esenciales (manejo de tokens, validación, saneamiento, excepciones HTTP, manejo de errores), archivos de configuración clave (`package.json`, `tsconfig.json`, `.env`, `.gitignore`) y archivos de configuración específicos para Express (`controllers.json`, `services.json`). Permite incluir opcionalmente middleware de logging estructurado (Pino).
    *   **Docker (Servidor de Estáticos con Nginx)**: Genera archivos `Dockerfile`, `docker-compose.yml` y una configuración base de Nginx (`default.conf`) para servir micro-frontends estáticos.
*   **Generación Rápida de Artefactos**: Permite la creación ágil de:
    *   **Micro-frontends Preact**: Genera la estructura completa de un nuevo micro-frontend Preact con Vite, incluyendo configuración automática de rutas de compilación, scripts de desarrollo y build, e integración con una librería de componentes compartidos (`@aguayodevs-utilities/preact-shared@^1.0.4`).
    *   **Stubs de Backend Express**: Crea archivos básicos de Controlador y Servicio Express dentro de la estructura de backend inicializada, siguiendo convenciones de dominio/característica. **Genera automáticamente archivos de test básicos** para estos stubs (usando Jest y Supertest).
*   **Configuración Automatizada**:
    *   Configura automáticamente `vite.config.ts` en los micro-frontends generados para alinearse con la estructura de monorepositorio (rutas `base` y `outDir`).
    *   Actualiza el `package.json` del micro-frontend con scripts `dev` (con puerto configurable) y `build:dev`.
    *   Registra cada nuevo micro-frontend en un archivo centralizado (`.frontforge/frontForgeFronts.json`) utilizado para la compilación global.
    *   Registra los stubs de controlador y servicio Express generados en archivos de configuración específicos (`.frontforge/express/controllers.json` y `.frontforge/express/services.json`).
    *   Añade **endpoints básicos de Health (`/healthz`) y Readiness (`/readyz`)** a la plantilla de aplicación Express.
    *   Configura **aliases de módulos en `tsconfig.json`** y añade la integración de `module-alias` para simplificar las importaciones en proyectos Express.
    *   Proporciona un comando para generar **archivos `.env` por entorno** (`frontforge env:add`).
    *   Ofrece un comando para inicializar la configuración de **Linting (ESLint), Formatting (Prettier) y Git Hooks (Husky)** (`frontforge lint:init`).
*   **Generación de Documentación**: Permite generar una especificación **Swagger/OpenAPI** básica a partir de comentarios en el código backend (`frontforge doc`).
*   **Compilación Centralizada**: Facilita la compilación de todos los micro-frontends registrados en `.frontforge/frontForgeFronts.json` mediante la ejecución de `npm run build` en el directorio de cada proyecto.
*   **Flexibilidad de Uso**: Puede ser utilizado como una herramienta CLI global/npx o importado como librería Node.js para scripts personalizados.
 
## 📦 Instalación

`frontforge` está diseñado para ser ejecutado desde la **raíz de tu monorepositorio** (o en un directorio vacío para el comando `init`). Puedes usarlo directamente con `npx` o instalarlo globalmente:

```bash
# Usar con npx (recomendado para evitar instalación global)
npx @aguayodevs-utilities/frontforge <comando> [opciones]

# O instalar globalmente (opcional)
npm install -g @aguayodevs-utilities/frontforge
frontforge <comando> [opciones]
```

## ⚙️ Estructura de Proyecto y Configuración

Los comandos `create` y `build` operan bajo la expectativa de una estructura de directorios y archivos específica dentro de tu monorepositorio. El comando `init` ayuda a establecer esta estructura para proyectos Node.js/Express.

*   `./fronts/`: Directorio principal para alojar los micro-frontends (ej. `./fronts/admin/miFeature`).
*   `./public/`: Directorio de salida para los assets compilados de los frontends (ej. `./public/admin/miFeature/assets/...`).
*   `./src/controllers/` (para Express): Ubicación de los controladores Express.
*   `./src/services/` (para Express): Ubicación de los servicios Express.
*   `./src/classes/` (para Express): Contiene clases de utilidad base.
*   `./src/interfaces/` (para Express): Directorio para interfaces compartidas del backend.
*   `./src/types/` (para Express): Directorio para tipos compartidos del backend.
*   `./.frontforge/`: Directorio de configuración de `frontforge`.
    *   `./.frontforge/config.json`: Archivo de configuración principal que especifica el tipo de backend (`express`, `docker`, etc.). Creado por `init`.
    *   `./.frontforge/frontForgeFronts.json`: Lista de micro-frontends registrados. Creado/actualizado por `create preact`, leído por `build`.
    *   `./.frontforge/express/controllers.json` (para Express): Lista de controladores Express generados. Creado/actualizado por `create controller`.
    *   `./.frontforge/express/services.json` (para Express): Lista de servicios Express generados. Creado/actualizado por `create service`.
*   `./src/apps/environment.ts` (Opcional, para Express): Si existe, `create preact` intentará añadir la ruta de assets del nuevo frontend al array `frontPathAssets`. **Nota: Esta integración es experimental y puede requerir ajustes manuales.**

## 🚀 Uso de la Interfaz de Línea de Comandos (CLI)

### 1. Inicializar un Proyecto (`init`)
 
Este comando configura la estructura base para un nuevo proyecto compatible con `frontforge`. Debe ejecutarse en un **directorio vacío**.
 
```bash
npx @aguayodevs-utilities/frontforge init [--skip-install] [--with-logger]
```
 
Se te presentará una lista para seleccionar el tipo de proyecto a inicializar:
 
*   **Node.js (Express Backend)**:
    *   Crea la estructura de directorios (`src/classes`, `src/interfaces`, `src/types`, `public`, `.frontforge`).
    *   Genera archivos base para Express y utilidades, incluyendo **endpoints de Health (`/healthz`) y Readiness (`/readyz`)**.
    *   Crea archivos de configuración `.frontforge/express/controllers.json` y `.frontforge/express/services.json`.
    *   Crea/actualiza archivos raíz (`package.json`, `tsconfig.json` con **configuración de `paths`**, `.gitignore`, `.env`).
    *   Instala dependencias base (`express`, `dotenv`, `cors`, `jsonwebtoken`, `module-alias`, etc.) y dependencias de desarrollo (`typescript`, `ts-node`, `nodemon`, `jest`, `supertest`, `ts-jest`, etc.) a menos que se use la opción `--skip-install`.
    *   **Opcionalmente**, instala dependencias para logging estructurado (`pino`, `pino-http`) si se usa la opción `--with-logger`.
*   **Docker (Servidor de Estáticos con Nginx)**:
    *   Crea el directorio `.frontforge`.
    *   Genera `Dockerfile`, `docker-compose.yml` y `nginx/default.conf`.
 
Opciones:
*   `--skip-install` (o `-s`): Omite la instalación automática de dependencias npm.
*   `--with-logger`: Incluye middleware de logging estructurado (Pino) en el proyecto Express inicializado.
 
### 2. Crear un Artefacto (`create`)

Genera un nuevo micro-frontend Preact, un servicio Express o un controlador Express. Ejecuta este comando desde la **raíz de tu monorepositorio**.

```bash
npx @aguayodevs-utilities/frontforge create <type> <name> [--port <numero>]
```

*   `<type>`: Especifica el tipo de artefacto a crear. Valores permitidos: `preact`, `service`, `controller`. (Requerido)
*   `<name>`: Define el nombre y la ruta del artefacto. (Requerido)
    *   Para `preact`: La ruta determina la ubicación del micro-frontend dentro de `./fronts/` (ej. `admin/user-management` creará `./fronts/admin/user-management/`). El último segmento (`user-management`) se usa como nombre del proyecto y se normaliza a `camelCase` (`userManagement`).
    *   Para `service` o `controller`: La ruta determina la ubicación del stub dentro de `./src/controllers/` o `./src/services/` (ej. `users/auth` creará `./src/controllers/users/auth.controller.ts` o `./src/services/users/auth.service.ts`). El último segmento (`auth`) se normaliza a `camelCase` (`auth`).
*   `--port <numero>` (o `-p <numero>`): Define el puerto para el servidor de desarrollo Vite del micro-frontend (solo para `type=preact`). (Opcional, por defecto: `5173`).

**Ejemplos de uso:**

```bash
# Crear un micro-frontend Preact en fronts/admin/reports, usando el puerto 3001
npx @aguayodevs-utilities/frontforge create preact admin/reports --port 3001

# Crear un servicio Express en src/services/users/auth.service.ts
npx @aguayodevs-utilities/frontforge create service users/auth

# Crear un controlador Express en src/controllers/products/inventory.controller.ts
npx @aguayodevs-utilities/frontforge create controller products/inventory
```

### 3. Generar Documentación (`doc`)
 
Genera la documentación Swagger/OpenAPI para el proyecto backend Express a partir de comentarios en el código. Ejecuta este comando desde la **raíz de tu proyecto backend**.
 
```bash
npx @aguayodevs-utilities/frontforge doc
```
 
Este comando lee los archivos en `src/controllers` y `src/services` (y otros directorios configurados) buscando comentarios JSDoc/TSDoc compatibles con Swagger y genera un archivo `docs/openapi.yaml`.
 
### 4. Inicializar Configuración de Linting (`lint:init`)
 
Configura ESLint, Prettier y Husky para asegurar la calidad y homogeneidad del código mediante hooks de Git. Ejecuta este comando desde la **raíz de tu proyecto**.
 
```bash
npx @aguayodevs-utilities/frontforge lint:init
```
 
Este comando añade las dependencias necesarias (`eslint`, `prettier`, `husky`, `lint-staged`, etc.) al `package.json`, configura el script `prepare` para Husky, añade la configuración de `lint-staged` y copia archivos de configuración estándar (`.eslintrc.json`, `.prettierrc.js`).
 
### 5. Añadir Archivo .env por Entorno (`env:add`)
 
Crea un archivo `.env.<environment>` para gestionar variables de entorno específicas para diferentes entornos (staging, production, etc.). Ejecuta este comando desde la **raíz de tu proyecto**.
 
```bash
npx @aguayodevs-utilities/frontforge env:add <environment>
```
 
*   `<environment>`: Nombre del entorno (ej. `staging`, `production`). (Requerido)
 
Este comando crea el archivo `.env.<environment>` con contenido base si no existe. Para cargar estas variables en tu aplicación Express, puedes modificar tu punto de entrada (`src/index.ts`) para usar `dotenv.config({ path: \`.env.\${process.env.NODE_ENV}\` });` basado en la variable de entorno `NODE_ENV`.
 
### 6. Compilar Todos los Micro-Frontends (`build`)
 
Compila todos los micro-frontends listados en el archivo `.frontforge/frontForgeFronts.json`. Ejecuta este comando desde la **raíz de tu monorepositorio**.
 
```bash
npx @aguayodevs-utilities/frontforge build
```
 
Este comando itera sobre cada entrada en el archivo de configuración de frontends y ejecuta `npm run build` en el directorio especificado por `projectFullPath`.
 
## 🛠️ API Programática

`frontforge` puede ser importado y utilizado como una librería en tus scripts Node.js para automatizar tareas o integrarlo en flujos de trabajo personalizados.

```typescript
import { initProject, createFrontendPreact, buildAll } from '@aguayodevs-utilities/frontforge';
import path from 'node:path';
import fs from 'fs-extra';

async function automateProjectSetup() {
  const projectRoot = path.resolve('./mi-proyecto-automatizado'); // Define la ruta del proyecto

  try {
    // Asegurar que el directorio del proyecto exista y cambiar a él
    await fs.ensureDir(projectRoot);
    process.chdir(projectRoot); 
    console.log(`Inicializando proyecto en: ${process.cwd()}`);
    
    // Inicializar un proyecto Express (la selección interactiva es solo para CLI)
    await initProject({ installDeps: true }); 
    console.log('Proyecto backend Express inicializado.');

    // Crear un nuevo frontend Preact dentro del proyecto
    console.log('Creando frontend de ejemplo...');
    await createFrontendPreact('dashboard', 'overview', { port: 3006 });
    console.log('Frontend "dashboard/overview" creado.');

    // Crear un servicio y controlador de ejemplo
    console.log('Creando stubs de backend...');
    // Asegúrate de que el tipo de backend en .frontforge/config.json sea 'express'
    // Esto ya lo hizo initProject({ installDeps: true })
    await createService({ domain: 'users', feature: 'profile' });
    await createController({ domain: 'users', feature: 'profile' });
    console.log('Stubs de servicio y controlador "users/profile" creados.');

    // Compilar todos los frontends registrados
    console.log('Compilando todos los frontends...');
    await buildAll();
    console.log('Compilación de frontends completada.');

  } catch (error) {
    console.error('Error durante la automatización:', error);
  } finally {
    // Es crucial volver al directorio original si cambiaste con process.chdir
    // process.chdir('..'); // Asumiendo que el script se ejecuta desde el directorio padre
    console.log(`Volviendo al directorio original: ${process.cwd()}`);
  }
}

automateProjectSetup();
```

## 📁 Estructura del Paquete (`@aguayodevs-utilities/frontforge`)

*   `dist/`: Contiene el código compilado (JavaScript CJS + tipos `.d.ts`) y las plantillas copiadas, listo para ser publicado en npm.
*   `src/`: Código fuente original en TypeScript.
    *   `features/`: Implementa la lógica principal de los comandos CLI (`initProject`, `createFrontend`, `buildAll`).
    *   `tasks/`: Módulos con tareas específicas y reutilizables.
        *   `init-express/`: Tareas para la inicialización de proyectos Express.
        *   `init-docker/`: Tareas para la inicialización de proyectos Docker.
        *   `preact/`: Tareas relacionadas con la creación y configuración de micro-frontends Preact.
        *   `express/`: Tareas para la generación de stubs de backend Express.
    *   `interfaces/`: Definiciones de tipos e interfaces TypeScript.
    *   `utils/`: Funciones de utilidad general (ejecución de comandos, normalización de nombres, copia de plantillas).
    *   `cli.ts`: Define la interfaz de línea de comandos utilizando `yargs`.
    *   `index.ts`: Punto de entrada principal para el uso como librería programática.
*   `templates/`: Directorio que contiene las plantillas base utilizadas para generar archivos.
    *   `backend-init/`: Plantillas para la inicialización de proyectos Express.
    *   `backend/`: Plantillas para los stubs de controlador y servicio Express.
    *   `docker/`: Plantillas para la inicialización de proyectos Docker.
    *   `frontend/`: Plantillas para la creación de micro-frontends Preact.
*   `README.md`: Este archivo de documentación.
*   `package.json`: Archivo de configuración del paquete npm, incluyendo metadatos, dependencias y scripts.
*   `LICENCE`: Archivo que contiene la licencia del proyecto (ISC).
*   `scripts/`: Scripts auxiliares (ej. `copy-templates.js`).

## 🤝 Contribuciones y Publicación

Las contribuciones son bienvenidas. Sigue estos pasos para contribuir:

1.  **Desarrollo**: Realiza tus cambios en los archivos bajo la carpeta `src/`.
2.  **Linting**: Asegura la calidad y estilo del código ejecutando `npm run lint`.
3.  **Testing**: (TODO: Implementar y añadir instrucciones para ejecutar tests unitarios/de integración).
4.  **Compilación**: Compila el código TypeScript a JavaScript y copia las plantillas ejecutando `npm run build`. Esto generará el contenido de la carpeta `dist/`.
5.  **Versionado**: Incrementa la versión en el archivo `package.json` siguiendo las directrices de [Versionado Semántico (SemVer)](https://semver.org/).
6.  **Commit y Etiqueta**: Realiza un commit de tus cambios y crea una etiqueta Git con la nueva versión (ej. `git tag vX.Y.Z`).
7.  **Push**: Sube tus commits y la etiqueta al repositorio remoto (ej. `git push origin main --tags`).
8.  **Publicación**: Publica el paquete en npm ejecutando `npm run publish-frontforge`. Este script se encarga de instalar dependencias, compilar y publicar con acceso público.

## 📜 Historial de Cambios

Consulta el [CHANGELOG.md](CHANGELOG.md) para un historial detallado de las versiones y cambios.

---

Licencia ISC - Miguel Aguayo