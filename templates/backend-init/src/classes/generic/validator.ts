import { ExceptionObject } from "../../interfaces/interface.server";
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
}