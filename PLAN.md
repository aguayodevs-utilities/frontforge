# Plan de empaquetado para `@miempresa/frontforge`

```mermaid
flowchart TD
  A[Monorepo raíz (check-ai-apiux)] --> B[framework/frontForge]
  B --> C[package.json (nuevo)]
  B --> D[tsconfig.build.json]
  B --> E[src/ → código fuente TypeScript]
  E --> F[build → dist/ (CJS + ESM + .d.ts)]
  F --> G[publicación npm (public)]
  B --> H[templates]
  H --> I[Preact, React, Vue…]
  A --> J[src/backend → configuraciones comunes]
  J --> K[@miempresa/shared]
```

## 1. Estructura del paquete `frontForge`
- Crear `framework/frontForge/package.json` con:
  - `name`: `@miempresa/frontforge`
  - `version`, `description`, `license`, `repository`
  - scripts:
    - `build`: `tsc --build`
    - `lint`: `eslint "src/**/*.{ts,js}"`
    - `prepare`: `npm run build`
    - `prepublishOnly`: `npm test`
  - `bin`: `"frontforge": "./dist/bin/frontforge.js"`
- Añadir `framework/frontForge/tsconfig.build.json` con salida en `dist/` y `declaration: true`

## 2. Código fuente y exportaciones
- Mover `index.ts` y módulos a `src/`
- Exponer API pública:
  - CLI (`create`, `build`)
  - Funciones programáticas (`createFrontend`, `buildAll`)
- Ajustar imports y configurar alias (`paths`) en `tsconfig.json`

## 3. Proceso de build
- Ejecutar `tsc --build tsconfig.build.json` para CJS + ESM y `.d.ts`
- Validar con ESLint y type-check antes de publicar

## 4. Gestión de plantillas (templates)
- Incluir `dist/templates/...` con plantillas de frontend
- CLI:
  - `npx frontforge create domain/feature`
  - Copia y renombra plantilla a `domain/feature/`
  - Personaliza `package.json`, archivos Vite, index.html
- Plantilla resultante:
  - `"private": false`
  - `"name": "domain-feature"`
  - Dependencias: `preact`, `@miempresa/shared`
  - Dev dependencies: `vite`, presets

## 5. Paquete de configuración compartida
- Extraer `shared/` a `packages/shared`
- Publicar como `@miempresa/shared`
- Incluir configuraciones de Vite, ESLint, tsconfig, estilos

## 6. Documentación y CI/CD
- Actualizar README con instalación y ejemplos
- Crear `CHANGELOG.md` y `CONTRIBUTING.md`
- Configurar GitHub Actions:
  - lint → build → test → publish

## 7. Integración con backend monolítico
- Analizar `src/` del backend y extraer variables de entorno comunes
- Hooks para registrar rutas/middleware en Express al generar frontend
- Configuraciones compartidas en `@miempresa/shared`

## Próximos pasos
1. Crear `package.json` y `tsconfig.build.json` en `framework/frontForge`  
2. Reestructurar código en `src/`  
3. Configurar scripts y CI/CD  
4. Publicar la primera versión alpha en npm

<!-- Fin del plan -->