import { GenericObject } from "../../types/generic.types";
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
}