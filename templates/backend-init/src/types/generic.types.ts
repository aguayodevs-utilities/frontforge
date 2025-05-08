/**
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