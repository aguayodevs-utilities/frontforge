/**
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
    /** Stack trace del error (opcional, para depuración). */
    stack?: string;
}

// Añadir otras interfaces compartidas del servidor aquí si es necesario
// Ejemplo:
// export interface ApiResponse<T> {
//   success: boolean;
//   data?: T;
//   error?: string;
// }