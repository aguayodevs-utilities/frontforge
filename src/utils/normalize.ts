import { camelCase, pascalCase } from 'change-case';

/**
 * @interface NormalizedNames
 * Define la estructura del objeto devuelto por la función `normalize`.
 * Contiene diferentes variaciones de caso para un nombre de entrada.
 * @property {string} raw - El nombre original sin modificar.
 * @property {string} camel - El nombre convertido a camelCase (ej. 'miNombre').
 * @property {string} pascal - El nombre convertido a PascalCase (ej. 'MiNombre').
 */
interface NormalizedNames {
  raw: string;
  camel: string;
  pascal: string;
}

/**
 * Normaliza un nombre de característica o componente a diferentes formatos de caso.
 * Utiliza la librería `change-case` para las conversiones.
 *
 * @function normalize
 * @param {string} name - El nombre original a normalizar.
 * @returns {NormalizedNames} Un objeto que contiene el nombre original (`raw`),
 *                            la versión en camelCase (`camel`) y la versión en PascalCase (`pascal`).
 * @example
 * const names = normalize('mi-feature-numero-1');
 * // names = { raw: 'mi-feature-numero-1', camel: 'miFeatureNumero1', pascal: 'MiFeatureNumero1' }
 */
export const normalize = (name: string): NormalizedNames => ({
  raw:   name, // Nombre original
  camel: camelCase(name), // Convertido a camelCase
  pascal: pascalCase(name) // Convertido a PascalCase
});
