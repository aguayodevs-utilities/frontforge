import express, { Express, Request, Response, NextFunction } from 'express';
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
console.log(`ℹ️  Sirviendo archivos estáticos desde: ${staticPath}`); // Backticks escapados
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
    const error = new HttpException({ statusCode: 404, message: `Ruta no encontrada: ${req.originalUrl}` }); // Backticks escapados
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
  console.log(`⚡️[server]: Servidor Express corriendo en http://localhost:${port}`); // Backticks escapados
  console.log(`   -> Entorno: ${process.env.NODE_ENV || 'development'}`); // Backticks escapados
});