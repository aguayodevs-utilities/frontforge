import { camelCase, pascalCase } from 'change-case';

export const normalize = (name: string) => ({
  raw:   name,
  camel: camelCase(name),
  pascal: pascalCase(name)
});
