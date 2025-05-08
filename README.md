# frontforge

CLI y librería para generar y compilar micro-frontends (Preact) con servidor de express para app monorepositorio.

## Instalación

Como paquete global o en tu proyecto:

```bash
npm install -g @aguayodevs-utilities/frontforge
frontforge create [your_domain_path]/[your_front_name] --port [your_port_for_test]
frontforge build
# o bien:
npx @aguayodevs-utilities/frontforge create [your_domain_path]/[your_front_name] --port [your_port_for_test]
npx @aguayodevs-utilities/frontforge build
```

## Uso CLI ejemplos:
### Crear Frontend Preact
```bash
# Crear un micro-frontend (dominio/feature)
npx @aguayodevs-utilities/frontforge create admin/reports --port 3000
```
### Compilar todos los frontend
```bash
# Compilar todos los frontends listados en fronts.json
npx @aguayodevs-utilities/frontforge build
```

## API programática

```ts
import yargs, { ArgumentsCamelCase } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createFrontend } from './features/createFrontend';
import { buildAll }       from './features/buildAll';

interface CreateArgs extends ArgumentsCamelCase {
  path: string;
  port: number;
}

yargs(hideBin(process.argv))
  .command<CreateArgs>(
    'create <path> [port]',
    'Genera micro-frontend',
    (y) =>
      y
        .positional('path', {
          describe: 'dominio/feature (ej. admin/reports)',
          type: 'string',
          demandOption: true
        })
        .option('port', { alias: 'p', type: 'number', default: 5173 }),
    (argv) => {
      const parts = argv.path.split('/');
      if (parts.length < 2) {
        console.error('❌  Formato requerido: dominio/feature (ej. admin/reports)');
        process.exit(1);
      }
      const featureName = parts.pop()!;
      const domainPath = parts.join('/');
      console.log("createFrontend With:", {domainPath, featureName, argv});
      createFrontend(domainPath, featureName, argv);
    }
  )
  .command('build', 'Compila todos', () => {}, buildAll)
  .demandCommand(1)
  .strict()
  .help()
  .parse();
```

## Estructura del paquete

- `dist/`  
  Código compilado + templates (CJS + tipos `.d.ts`)  
- `src/`  
  Fuente en TypeScript  
- `README.md`  
  Instrucciones del framework
- `LICENCE`
  Licencia tipo ISC

## Contribuciones y publicación

- Antes de publicar, asegúrate de:
  - Ejecutar `npm run lint`
  - Ejecutar `npm test`
  - Ejecutar `npm run build`
- Versionado semántico y etiquetas GitHub Releases