import { ExceptionObject } from "../../interfaces/interface.server";
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
            this.errorObject.error.message = `Invalid or expired token: ${error.message}`;
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
}