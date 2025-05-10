// Registrar aliases de módulos definidos en tsconfig.json
import 'module-alias/register';
 
import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
// Importaciones usando alias de ejemplo:
// import { HttpException } from '@src/classes/http/HttpException';
// import { HttpErrorHandler } from '@src/classes/http/error/handler';
// import { ExceptionObject } from '@src/interfaces/interface.server'; // Importar interfaz
// Por ahora, mantenemos las rutas relativas para compatibilidad con la plantilla base
import { HttpException } from './classes/http/HttpException';
import { HttpErrorHandler } from './classes/http/error/handler';
import { ExceptionObject } from './interfaces/interface.server'; // Importar interfaz
 
// Cargar variables de entorno desde .env (si existe)
// Para usar archivos .env.<environment> (ej. .env.staging, .env.production),
// puedes pasar la opción 'path' a dotenv.config() basada en process.env.NODE_ENV.
// Ejemplo: dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
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
console.log(`ℹ️  Sirviendo archivos estáticos desde: ${staticPath}`); // Backticks escapados
app.use(express.static(staticPath));

// --- Rutas de API ---
// Endpoints de Health y Readiness para orquestadores (ej. Kubernetes)
app.get('/healthz', (req: Request, res: Response) => {
  // Endpoint de Health: Indica si la aplicación está viva
  res.status(200).json({ status: 'ok', message: 'API Backend is healthy' });
});

app.get('/readyz', (req: Request, res: Response) => {
  // Endpoint de Readiness: Indica si la aplicación está lista para manejar tráfico
  // TODO: Implementar lógica de readiness real (ej. conexión a DB, otros servicios)
  res.status(200).json({ status: 'ok', message: 'API Backend is ready' });
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
    const error = new HttpException({ statusCode: 404, message: `Ruta no encontrada: ${req.originalUrl}` }); // Backticks escapados
    next(error); // Pasa el error al siguiente middleware (el manejador de errores)
});

// --- Manejador Global de Errores ---
// Este middleware captura todos los errores pasados por 'next(error)'
app.use((err: Error | HttpException, req: Request, res: Response, next: NextFunction) => {
    // Utiliza la clase HttpErrorHandler para loguear y enviar la respuesta
    // La clase HttpErrorHandler internamente maneja la creación del objeto de detalles del error.
    new HttpErrorHandler(err, res);
});


// --- Iniciar el Servidor ---
app.listen(port, () => {
  console.log(`⚡️[server]: Servidor Express corriendo en http://localhost:${port}`); // Backticks escapados
  console.log(`   -> Entorno: ${process.env.NODE_ENV || 'development'}`); // Backticks escapados
});