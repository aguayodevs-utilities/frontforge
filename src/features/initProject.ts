import path from 'node:path';
import fs from 'fs-extra';
import { commandRunner } from '../utils/commandRunner';
// Importar tipos o interfaces si son necesarios para las opciones

/**
 * @interface InitProjectOptions
 * Opciones para la función `initProject`.
 * @property {boolean} [installDeps=true] - Si es true, ejecuta `npm install` después de crear los archivos.
 */
interface InitProjectOptions {
  installDeps?: boolean;
}

// Contenido de los archivos a crear
// (Se movió aquí para mejor organización)
const classContents = {
  sanitizer: `/**
 * Clase genérica para sanitizar objetos.
 */
export class GenericSanitizer<T> {
    /**
     * Elimina espacios en blanco al inicio y final de todas las propiedades string de un objeto.
     * @param {T} object - El objeto a sanitizar.
     * @returns {T} Un nuevo objeto con las strings sanitizadas.
     */
    public sanitizeStrings(object: T): T {
        const sanitizedObject = { ...object };
        Object.entries(sanitizedObject as object).forEach(([key, value]) => {
            if (typeof value === "string") {
                (sanitizedObject as any)[key] = value.trim();
            }
        });
        return sanitizedObject;
    }

    /**
     * Convierte propiedades string que representan números válidos a tipo number.
     * @param {T} object - El objeto a sanitizar.
     * @returns {T} Un nuevo objeto con los números sanitizados.
     */
    public sanitizeNumbers(object: T): T {
        const sanitizedObject = { ...object };
        Object.entries(sanitizedObject as object).forEach(([key, value]) => {
            if (typeof value === "string" && value.trim() !== '' && !isNaN(Number(value))) { // Añadido chequeo de string no vacía
                (sanitizedObject as any)[key] = Number(value);
            }
        });
        return sanitizedObject;
    }
}`,
  token: `import { ExceptionObject } from "../../interfaces/interface.server";
import { GenericUserType } from "../../types/generic.types";
import { HttpException } from "../http/exception";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from 'dotenv';

// Cargar variables de entorno para JWT_SECRET
dotenv.config();

/**
 * @interface ErrorObject
 * Estructura interna para manejar errores de validación de token.
 */
interface ErrorObject {
    valid: boolean,
    error: ExceptionObject
}

/**
 * Clase para manejar y validar JSON Web Tokens (JWT).
 */
export class GenericToken {
    public payload: JwtPayload | undefined;
    public errorObject: ErrorObject = {valid: true, error:{
        message: "Invalid token.",
        statusCode: 401,
    }};
    private jwtSecret: string;

    /**
     * Crea una instancia de GenericToken.
     * @param {string} [sourcePath="classes/generic/token.ts"] - Ruta del archivo para trazabilidad de errores.
     * @param {string | undefined} token - El token JWT a procesar.
     */
    constructor(private sourcePath: string = "classes/generic/token.ts", private token: string | undefined) {
        this.errorObject.error.filePath = this.sourcePath;
        this.jwtSecret = process.env.JWT_SECRET || "DEFAULT_SECRET"; // Usar una variable de entorno o un secreto por defecto seguro
        if (!process.env.JWT_SECRET) {
            console.warn("⚠️ JWT_SECRET no está definida en las variables de entorno. Usando secreto por defecto inseguro.");
        }
        if(this.token) {
            this.decodeToken(this.token);
        } else {
            this.payload = undefined; // Asegurar que payload sea undefined si no hay token
        }
    }

    /**
     * Decodifica y verifica el token JWT.
     * Almacena el payload decodificado en this.payload o lanza HttpException si falla.
     * @private
     * @param {string} token - El token JWT a decodificar.
     * @throws {HttpException} Si el token es inválido o ha expirado.
     */
    private decodeToken(token: string): void {
        try {
            const decodedToken = jwt.verify(token, this.jwtSecret);
            // Asegurarse de que sea un objeto (JwtPayload lo es implícitamente)
            if (typeof decodedToken === 'string' || !decodedToken) {
                 throw new Error("Invalid token payload");
            }
            this.payload = decodedToken as JwtPayload; // Type assertion
        } catch (error: any) {
            this.errorObject.valid = false; // Marcar como inválido
            this.errorObject.error.message = \`Invalid or expired token: \${error.message}\`;
            this.errorObject.error.errorData = { errorName: error.name };
            throw new HttpException(this.errorObject.error);
        }
    }

    /**
     * Valida si el token existe y ha sido decodificado correctamente.
     * @returns {boolean} True si el token es válido, false en caso contrario.
     */
    public validateToken(): boolean {
        // validateToken ahora solo verifica si el payload existe (la decodificación ya valida)
        return !!this.payload;
    }

    /**
     * Valida si el tipo de usuario en el payload del token coincide con el/los tipo(s) requerido(s).
     * @param {GenericUserType | GenericUserType[]} userType - El tipo o array de tipos de usuario permitidos.
     * @throws {HttpException} Si el tipo de usuario no es válido o no coincide.
     */
    public validateUserType(userType: GenericUserType | GenericUserType[]): void {
        if (!this.payload || typeof this.payload.userType !== 'string') {
             this.errorObject.valid = false;
             this.errorObject.error.message = "User type missing or invalid in token payload.";
             throw new HttpException(this.errorObject.error);
        }

        const tokenUserType = this.payload.userType;

        try {
            // console.log({
            //     required: userType,
            //     token: tokenUserType
            // }); // Log de depuración

            const isAllowed = Array.isArray(userType)
                ? userType.includes(tokenUserType)
                : tokenUserType === userType;

            if (!isAllowed) {
                this.errorObject.valid = false;
                this.errorObject.error.message = "User type not permitted for this action.";
                this.errorObject.error.statusCode = 403; // Forbidden
                throw new HttpException(this.errorObject.error);
            }
            // Si llega aquí, el tipo es válido
        } catch (error) {
            // Si ya es una HttpException, relanzarla, sino envolverla
            if (error instanceof HttpException) {
                throw error;
            } else {
                 this.errorObject.valid = false;
                 this.errorObject.error.message = "Error during user type validation.";
                 this.errorObject.error.errorData = { originalError: error instanceof Error ? error.message : String(error) };
                 throw new HttpException(this.errorObject.error);
            }
        }
    }
}`,
  validator: `import { ExceptionObject } from "../../interfaces/interface.server";
import { HttpException } from "../http/exception";

/**
 * @interface ErrorObjectValidation
 * Estructura interna para manejar errores de validación.
 */
interface ErrorObjectValidation {
    valid: boolean,
    error: ExceptionObject
}

/**
 * Clase genérica para realizar validaciones comunes en objetos de datos.
 */
export class GenericValidator<T extends object> { // Asegurar que T sea un objeto
    public errorObject: ErrorObjectValidation = {valid: true, error:{
        message: "Invalid input arguments",
        statusCode: 400, // Bad Request
    }};

    /**
     * Crea una instancia de GenericValidator.
     * @param {string} [sourcePath="GenericValidator.ts"] - Ruta del archivo para trazabilidad de errores.
     */
    constructor(private sourcePath: string = "GenericValidator.ts") {
        this.errorObject.error.filePath = this.sourcePath;
    }

    /**
     * Valida que ninguna propiedad string del objeto esté vacía (null, undefined o string vacío/solo espacios).
     * @param {T} objectToValidate - El objeto a validar.
     * @throws {HttpException} Si alguna propiedad string está vacía, con detalles en errorData.
     */
    public validateEmptyStrings(objectToValidate: T): void {
        const errors: Partial<Record<keyof T, string>> = {}; // Usar Partial y Record

        Object.entries(objectToValidate).forEach(([key, value]) => {
            if (
                value === null ||
                value === undefined ||
                (typeof value === "string" && value.trim() === "")
            ) {
                // Asegurar que key es una clave válida de T antes de asignarla
                errors[key as keyof T] = "This field cannot be empty";
            }
        });

        if (Object.keys(errors).length > 0) {
            this.errorObject.valid = false;
            this.errorObject.error.errorData = errors; // Asignar errores detallados
            this.errorObject.error.message = "Validation failed: Empty string(s) found."; // Mensaje más específico
            throw new HttpException(this.errorObject.error);
        }
        // Si no hay errores, no hace nada
    }

    // Podrían añadirse otros métodos de validación comunes aquí (ej. validateEmail, validateNumberRange, etc.)
}`,
  exception: `import { GenericObject } from "../../types/generic.types";
import { ExceptionObject } from "../../interfaces/interface.server";

/**
 * Clase de Error personalizada para excepciones HTTP.
 * Permite estandarizar los errores lanzados en la aplicación,
 * incluyendo un código de estado HTTP y datos adicionales opcionales.
 *
 * @class HttpException
 * @extends {Error}
 */
export class HttpException extends Error {
  /**
   * Código de estado HTTP asociado al error (ej. 400, 404, 500).
   * @type {number}
   */
  public statusCode: number;
  /**
   * Ruta del archivo donde se originó el error (opcional, para depuración).
   * @type {string | undefined}
   */
  public filePath?: string;
  /**
   * Objeto con datos adicionales sobre el error (ej. errores de validación).
   * @type {GenericObject | undefined}
   */
  public errorData?: GenericObject;

  /**
   * Crea una instancia de HttpException.
   * @constructor
   * @param {ExceptionObject} exceptionData - Objeto con los detalles de la excepción.
   * @param {string} exceptionData.message - Mensaje descriptivo del error.
   * @param {number} exceptionData.statusCode - Código de estado HTTP.
   * @param {string} [exceptionData.filePath] - Ruta del archivo origen (opcional).
   * @param {GenericObject} [exceptionData.errorData] - Datos adicionales del error (opcional).
   */
  constructor({ message, statusCode, filePath, errorData }: ExceptionObject) {
    super(message); // Llama al constructor de la clase Error
    this.statusCode = statusCode;
    this.filePath = filePath;
    this.errorData = errorData;
    // Corrige el prototipo para que instanceof funcione correctamente
    Object.setPrototypeOf(this, HttpException.prototype);
    // Captura el stack trace (opcional, puede ser útil para depuración)
    // Error.captureStackTrace(this, this.constructor);
  }
}`,
  handler: `import { Response } from "express";
import { ExceptionObject } from "../../../interfaces/interface.server"; // Ajustar ruta si es necesario
import { HttpException } from "../exception"; // Importar HttpException

/**
 * Clase para manejar errores HTTP en Express y enviar respuestas estandarizadas.
 */
export class HttpErrorHandler {
    /**
     * Crea una instancia de HttpErrorHandler y maneja el error inmediatamente.
     * @constructor
     * @param {HttpException | Error} err - El error capturado (puede ser HttpException u otro Error).
     * @param {Response} res - El objeto de respuesta Express.
     */
    constructor(
        private err: HttpException | Error, // Aceptar Error genérico también
        private res: Response,
    ) {
        this.sendErrorResponse();
    }

    /**
     * Envía una respuesta JSON estandarizada al cliente basada en el error.
     * Loguea el error completo en el servidor para depuración.
     * @private
     */
    private sendErrorResponse(): void {
        let errorDetails: ExceptionObject;

        // Si es una instancia de nuestra HttpException, usamos sus propiedades
        if (this.err instanceof HttpException) {
            errorDetails = {
                message: this.err.message,
                statusCode: this.err.statusCode,
                filePath: this.err.filePath,
                errorData: this.err.errorData,
            };
        } else {
            // Si es un error genérico, usamos 500 Internal Server Error
            errorDetails = {
                message: "Internal Server Error", // Mensaje genérico para el cliente
                statusCode: 500,
                // Podríamos añadir el mensaje original del error genérico a errorData para logs
                // errorData: { originalMessage: this.err.message }
            };
        }

        // Loguear el error completo en el servidor (incluyendo stack si es un Error)
        console.error("Error handled:", JSON.stringify({
            ...errorDetails,
            // Añadir stack trace si no es HttpException o si queremos loguearlo siempre
            stack: !(this.err instanceof HttpException) || process.env.NODE_ENV === 'local' ? this.err.stack : undefined
        }, null, 2));

        // Enviar solo mensaje y código de estado al cliente
        // Evitar enviar detalles internos como filePath o errorData al cliente por seguridad
        this.res.status(errorDetails.statusCode).json({ error: errorDetails.message });
    }
}`
};

const interfaceContent = `/**
 * Define la estructura estándar para los objetos de excepción utilizados
 * por HttpException y HttpErrorHandler.
 */
export interface ExceptionObject {
    /** Mensaje descriptivo del error para el cliente o logs. */
    message: string;
    /** Código de estado HTTP (ej. 400, 404, 500). */
    statusCode: number;
    /** Ruta del archivo donde se originó el error (opcional, para depuración). */
    filePath?: string;
    /** Objeto con datos adicionales sobre el error (ej. errores de validación). */
    errorData?: Record<string, any>;
}`;

const typesContent = `/**
 * Tipo genérico para representar un objeto con claves string y valores any.
 * Útil para datos adicionales en errores u objetos no estrictamente tipados.
 */
export type GenericObject = Record<string, any>;

/**
 * Define los tipos de usuario permitidos en la aplicación.
 * Ajustar según los roles o tipos reales del sistema.
 * Ejemplo: 'admin', 'editor', 'viewer', 'guest'
 */
export type GenericUserType = 'admin' | 'user' | string; // TODO: Ajustar a los tipos reales
`;

const indexTsContent = `import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { HttpException } from './classes/http/exception';
import { HttpErrorHandler } from './classes/http/error/handler';
import { ExceptionObject } from './interfaces/interface.server'; // Importar interfaz

// Cargar variables de entorno desde .env (si existe)
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000; // Usar variable de entorno PORT o 3000 por defecto

// --- Middlewares Esenciales ---
// Habilitar CORS - ¡Configurar origins permitidos en producción!
app.use(cors(/* { origin: 'URL_DE_TU_FRONTEND' } */));
// Parsear JSON request bodies
app.use(express.json());
// Parsear URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// --- Servir Archivos Estáticos ---
// Sirve los archivos compilados de los micro-frontends
// Asume que están en una carpeta 'public' en la raíz del monorepo
const staticPath = path.join(__dirname, '..', 'public'); // Ajusta si la estructura es diferente
console.log(\`ℹ️  Sirviendo archivos estáticos desde: \${staticPath}\`);
app.use(express.static(staticPath));

// --- Rutas de API ---
app.get('/api/health', (req: Request, res: Response) => {
  // Endpoint básico para verificar que la API está viva
  res.status(200).json({ status: 'ok', message: 'API Backend funcionando!' });
});

// --- Importar y Usar Routers de Dominios ---
// Aquí es donde se conectarán los controladores generados por 'frontforge create'
// Ejemplo:
// import { routerAdmin } from './routes/admin/route.admin'; // Asumiendo que tienes routers por dominio
// app.use('/api/admin', routerAdmin); // Montar router bajo /api/admin
// import { routerUser } from './routes/user/route.user';
// app.use('/api/user', routerUser);

// --- Manejo de Rutas No Encontradas (404) ---
// Este middleware se ejecuta si ninguna ruta anterior coincidió
app.use((req: Request, res: Response, next: NextFunction) => {
    // Crea una HttpException estándar para 404
    const error = new HttpException({ statusCode: 404, message: \`Ruta no encontrada: \${req.originalUrl}\` });
    next(error); // Pasa el error al siguiente middleware (el manejador de errores)
});

// --- Manejador Global de Errores ---
// Este middleware captura todos los errores pasados por 'next(error)'
app.use((err: Error | HttpException, req: Request, res: Response, next: NextFunction) => {
    // Asegurarse de que siempre sea un objeto ExceptionObject compatible
    const errorDetails: ExceptionObject = {
        message: err.message || 'Error interno del servidor',
        // Si es HttpException, usa su statusCode, sino es 500
        statusCode: (err instanceof HttpException) ? err.statusCode : 500,
        // Añadir detalles solo si es HttpException
        filePath: (err instanceof HttpException) ? err.filePath : undefined,
        errorData: (err instanceof HttpException) ? err.errorData : undefined,
        // Incluir stack trace solo en desarrollo/local para depuración
        stack: process.env.NODE_ENV === 'local' ? err.stack : undefined
    };
    // Utiliza la clase HttpErrorHandler para loguear y enviar la respuesta
    new HttpErrorHandler(errorDetails, res);
});


// --- Iniciar el Servidor ---
app.listen(port, () => {
  console.log(\`⚡️[server]: Servidor Express corriendo en http://localhost:\${port}\`);
  console.log(\`   -> Entorno: \${process.env.NODE_ENV || 'development'}\`);
});
`;

const packageJsonContent = `{
  "name": "mi-backend-frontforge",
  "version": "0.1.0",
  "description": "Backend inicializado con frontforge",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "dev": "cross-env NODE_ENV=local nodemon src/index.ts",
    "lint": "eslint src/**/*.ts",
    "format": "eslint src/**/*.ts --fix"
  },
  "keywords": [
    "express",
    "frontforge",
    "backend"
  ],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2"
    // Añadir más dependencias según sea necesario: mongoose, bcrypt, etc.
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node": "^20.14.11",
    "@typescript-eslint/eslint-plugin": "^7.16.1",
    "@typescript-eslint/parser": "^7.16.1",
    "cross-env": "^7.0.3",
    "eslint": "^8.57.0",
    "nodemon": "^3.1.4",
    "ts-node": "^10.9.2",
    "typescript": "^5.5.3"
    // Añadir @types/mongoose, etc. si se usan
  }
}`;


/**
 * Inicializa la estructura base de un proyecto backend Express compatible con `frontforge`.
 * Crea las carpetas necesarias, archivos de clases base, un `index.ts` inicial,
 * y un `package.json` con dependencias esenciales.
 *
 * @async
 * @function initProject
 * @param {InitProjectOptions} options - Opciones para controlar el proceso de inicialización.
 * @returns {Promise<void>} Promesa que se resuelve cuando la inicialización ha finalizado.
 * @throws {Error} Si ocurre un error durante la creación de archivos/carpetas o la instalación de dependencias.
 */
export async function initProject(options: InitProjectOptions = {}): Promise<void> {
  const { installDeps = true } = options; // Valor por defecto para instalar dependencias
  const projectRoot = process.cwd(); // Asume que se ejecuta en la raíz del nuevo proyecto backend

  console.log(`🚀 Inicializando estructura de backend en: ${projectRoot}`);

  // --- 1. Crear Estructura de Carpetas ---
  const dirsToCreate = [
    'src',
    'src/classes',
    'src/classes/generic',
    'src/classes/http',
    'src/classes/http/error',
    'src/interfaces',
    'src/types',
    'config',
    'src/routes', // Añadir carpeta de rutas
    'public' // Añadir carpeta pública para estáticos/builds
  ];

  console.log('\n[Paso 1/5] Creando estructura de directorios...');
  try {
    for (const dir of dirsToCreate) {
      const dirPath = path.join(projectRoot, dir);
      await fs.ensureDir(dirPath);
      console.log(`   -> Creado/asegurado: ${dir}`);
    }
    console.log('✅ Estructura de directorios creada.');
  } catch (error: any) {
    console.error('❌ Error al crear directorios:', error.message);
    throw error; // Detener si falla la creación de carpetas
  }

  // --- 2. Crear Archivos de Clases Base ---
  console.log('\n[Paso 2/5] Creando archivos de clases base...');
  try {
    await fs.writeFile(path.join(projectRoot, 'src/classes/generic/sanitizer.ts'), classContents.sanitizer);
    await fs.writeFile(path.join(projectRoot, 'src/classes/generic/token.ts'), classContents.token);
    await fs.writeFile(path.join(projectRoot, 'src/classes/generic/validator.ts'), classContents.validator);
    await fs.writeFile(path.join(projectRoot, 'src/classes/http/exception.ts'), classContents.exception);
    await fs.writeFile(path.join(projectRoot, 'src/classes/http/error/handler.ts'), classContents.handler);
    console.log('✅ Archivos de clases base creados.');
  } catch (error: any) {
    console.error('❌ Error al crear archivos de clases:', error.message);
    throw error;
  }

  // --- 3. Crear Archivos de Interfaces y Tipos ---
   console.log('\n[Paso 3/5] Creando archivos de interfaces y tipos...');
  try {
    await fs.writeFile(path.join(projectRoot, 'src/interfaces/interface.server.ts'), interfaceContent);
    await fs.writeFile(path.join(projectRoot, 'src/types/generic.types.ts'), typesContent);
    console.log('✅ Archivos de interfaces y tipos creados.');
  } catch (error: any) {
    console.error('❌ Error al crear archivos de interfaces/tipos:', error.message);
    throw error;
  }


  // --- 4. Crear Archivos Principales (index.ts, package.json) ---
  console.log('\n[Paso 4/5] Creando archivos principales (index.ts, package.json)...');
   try {
    await fs.writeFile(path.join(projectRoot, 'src/index.ts'), indexTsContent);
    // Crear package.json solo si no existe
    const pkgPath = path.join(projectRoot, 'package.json');
    if (!await fs.pathExists(pkgPath)) {
        await fs.writeFile(pkgPath, packageJsonContent);
        console.log('✅ Archivo package.json creado.');
    } else {
        console.log('ℹ️  Archivo package.json ya existe, no se sobrescribió.');
    }
    // Crear .env de ejemplo si no existe
    const envPath = path.join(projectRoot, '.env');
     if (!await fs.pathExists(envPath)) {
        await fs.writeFile(envPath, "PORT=3000\nJWT_SECRET=TU_SECRETO_JWT_AQUI\nNODE_ENV=local\n");
        console.log('✅ Archivo .env de ejemplo creado (¡recuerda configurarlo!).');
    }
     // Crear tsconfig.json básico si no existe
    const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
     if (!await fs.pathExists(tsconfigPath)) {
        await fs.writeJson(tsconfigPath, {
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
               "experimentalDecorators": true, // Necesario para algunas librerías como TypeORM/TypeGraphQL
               "emitDecoratorMetadata": true // Necesario para algunas librerías como TypeORM/TypeGraphQL
            },
            "include": ["src/**/*"],
            "exclude": ["node_modules", "**/*.spec.ts"]
          }, { spaces: 2 });
        console.log('✅ Archivo tsconfig.json básico creado.');
    }
     // Crear .gitignore básico si no existe
    const gitignorePath = path.join(projectRoot, '.gitignore');
     if (!await fs.pathExists(gitignorePath)) {
        await fs.writeFile(gitignorePath, "node_modules\ndist\n.env\n*.log\n");
        console.log('✅ Archivo .gitignore básico creado.');
    }

    console.log('✅ Archivos principales creados.');
  } catch (error: any) {
    console.error('❌ Error al crear archivos principales:', error.message);
    throw error;
  }

  // --- 5. Instalar Dependencias ---
  if (installDeps) {
    console.log('\n[Paso 5/5] Instalando dependencias (puede tardar)...');
    try {
        await commandRunner('npm', ['install'], { cwd: projectRoot, stdio: 'inherit' });
        console.log('✅ Dependencias instaladas.');
    } catch (error: any) {
        console.error('❌ Error durante la instalación de dependencias. Ejecuta "npm install" manualmente.');
        // No relanzamos el error aquí para que el resto de la inicialización se considere completa
    }
  } else {
      console.log('\n[Paso 5/5] Omitiendo instalación de dependencias. Ejecuta "npm install" manualmente.');
  }


  console.log('\n✨ Proyecto backend inicializado exitosamente!');
  console.log(`   Directorio: ${projectRoot}`);
  console.log('   -> Configura tu archivo .env (especialmente JWT_SECRET).');
  console.log('   -> Ejecuta "npm run dev" para iniciar el servidor en modo desarrollo.');
  console.log('   -> Empieza a añadir tus rutas en src/routes/ y controladores/servicios en src/controllers/ y src/services/.');
}