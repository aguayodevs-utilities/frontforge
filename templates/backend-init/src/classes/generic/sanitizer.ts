/**
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
}