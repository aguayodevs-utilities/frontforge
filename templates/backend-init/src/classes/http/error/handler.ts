import { Response } from "express";
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
}