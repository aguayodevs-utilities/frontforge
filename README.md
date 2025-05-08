# 🚀 frontforge

Herramienta CLI y librería Node.js para **generar y compilar micro-frontends** basados en [Preact](https://preactjs.com/) y [Vite](https://vitejs.dev/), junto con **stubs básicos de backend** ([Express](https://expressjs.com/)) dentro de una estructura de monorepositorio predefinida.

Diseñado para acelerar el desarrollo inicial de nuevas características en arquitecturas de micro-frontends acopladas a un backend Express monolítico o modular.

## ✨ Características

*   **Generación Rápida**: Crea un nuevo micro-frontend Preact con estructura base, configuración de Vite y dependencias esenciales (MUI, Emotion, Axios, dotenv) con un solo comando.
*   **Stubs de Backend**: Genera automáticamente archivos básicos de Controlador y Servicio Express asociados al nuevo frontend.
*   **Configuración Automática**:
    *   Configura `vite.config.ts` con las rutas `base` y `outDir` correctas para la integración en el monorepo.
    *   Actualiza `package.json` del frontend con scripts `dev` (con puerto) y `build:dev`.
    *   Registra el nuevo frontend en un archivo central `config/fronts.json`.
    *   (Opcional y frágil) Intenta registrar assets en `src/apps/environment.ts` del backend.
*   **Compilación Centralizada**: Compila todos los micro-frontends registrados en `config/fronts.json` con un solo comando.
*   **Uso Dual**: Funciona como herramienta CLI global/npx o como librería programática en scripts Node.js.

## 📦 Instalación

Puedes usar `frontforge` directamente con `npx` sin instalación global, o instalarlo globalmente si lo prefieres. Está pensado para ejecutarse desde la **raíz de tu monorepositorio**.

```bash
# Usar con npx (recomendado)
npx @aguayodevs-utilities/frontforge <comando> [opciones]

# O instalar globalmente (opcional)
npm install -g @aguayodevs-utilities/frontforge
frontforge <comando> [opciones]
```

## ⚙️ Configuración Requerida

`frontforge` asume la siguiente estructura de directorios y archivos dentro de tu monorepositorio:

*   `./fronts/`: Directorio raíz donde se crearán los micro-frontends (ej. `./fronts/admin/miFeature`).
*   `./public/`: Directorio donde Vite compilará los assets de los frontends (ej. `./public/admin/miFeature/assets/...`).
*   `./src/controllers/`: Directorio donde se crearán los controladores Express.
*   `./src/services/`: Directorio donde se crearán los servicios Express.
*   `./src/classes/`: Directorio que contiene clases base como `GenericToken` y `HttpException` (usadas en los templates de backend).
*   `./config/fronts.json`: Archivo JSON que lista los micro-frontends. `frontforge` lo crea/actualiza al usar `create` y lo lee al usar `build`. Formato esperado:
    ```json
    [
      {
        "name": "nombreEnCamelCase",
        "projectFullPath": "fronts/dominio/nombreEnCamelCase",
        "port": 5174
      },
      {
        "name": "otraFeature",
        "projectFullPath": "fronts/otroDominio/otraFeature",
        "port": 5175
      }
    ]
    ```
*   `./src/apps/environment.ts` (Opcional): Si existe, la tarea `deployAssets` intentará añadir la ruta de assets del nuevo frontend al array `frontPathAssets` dentro de este archivo. **Esta característica es frágil.**

## 🚀 Uso CLI

### 1. Crear un Micro-Frontend

Genera un nuevo micro-frontend Preact y sus stubs de backend.

```bash
npx @aguayodevs-utilities/frontforge create <dominio>/<feature> [--port <numero>]
```

*   `<dominio>/<feature>`: Ruta que define la ubicación y nombre. (Requerido)
    *   Ejemplo: `admin/user-management` creará el frontend en `./fronts/admin/user-management/` y los stubs en `./src/controllers/admin/`, `./src/services/admin/`.
    *   `feature` se convertirá a `camelCase` para nombres de archivo/clase (ej. `userManagement`).
*   `--port <numero>` (o `-p <numero>`): Puerto para el servidor de desarrollo Vite. (Opcional, por defecto: `5173`).

**Ejemplo:**

```bash
npx @aguayodevs-utilities/frontforge create admin/reports --port 3001
```

Esto creará:
*   Frontend en `./fronts/admin/reports/`
*   Controlador en `./src/controllers/admin/reports.controller.ts`
*   Servicio en `./src/services/admin/reports.service.ts`
*   Actualizará `./config/fronts.json`
*   Configurará `vite.config.ts` y `package.json` en `./fronts/admin/reports/`

### 2. Compilar Todos los Micro-Frontends

Compila todos los frontends listados en `config/fronts.json` ejecutando `npm run build` en cada uno de sus directorios (`projectFullPath`).

```bash
npx @aguayodevs-utilities/frontforge build
```

## 🛠️ API Programática

Puedes importar y usar las funciones principales en tus propios scripts Node.js.

```typescript
import { createFrontend, buildAll } from '@aguayodevs-utilities/frontforge';

async function main() {
  try {
    // Crear un nuevo frontend
    console.log('Creando frontend...');
    await createFrontend('shopping', 'product-detail', { port: 3005 });
    console.log('Frontend creado.');

    // Compilar todos los frontends
    console.log('Compilando todos...');
    await buildAll();
    console.log('Compilación completada.');

  } catch (error) {
    console.error('Error en el script:', error);
  }
}

main();
```

## 📁 Estructura del Paquete

*   `dist/`: Código compilado (JavaScript CJS + tipos `.d.ts`) y plantillas copiadas. Es lo que se publica en npm.
*   `src/`: Código fuente original en TypeScript.
    *   `features/`: Lógica principal para los comandos (`createFrontend`, `buildAll`).
    *   `tasks/`: Tareas específicas reutilizables (crear Preact, configurar Vite, generar stubs Express, actualizar JSONs, etc.).
    *   `interfaces/`: Definiciones de tipos e interfaces TypeScript.
    *   `utils/`: Funciones de utilidad (ejecutar comandos, normalizar nombres, copiar plantillas).
    *   `cli.ts`: Definición de la interfaz de línea de comandos con `yargs`.
    *   `index.ts`: Punto de entrada para el uso como librería.
*   `templates/`: Plantillas base para los archivos generados (frontend y backend).
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
8.  **Publicación**: Ejecuta `npm run publish-frontforge` (que internamente ejecuta `build` y `npm publish --access=public`).

---

Licencia ISC - Miguel Aguayo