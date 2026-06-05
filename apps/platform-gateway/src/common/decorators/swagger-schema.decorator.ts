import type { OpenAPIObject } from '@nestjs/swagger';

type SwaggerSchemaObject = Record<string, unknown>;

type ClassConstructor = new (...args: never[]) => unknown;

const SWAGGER_SCHEMA_METADATA_KEY = Symbol('swagger:schema');
const SWAGGER_SCHEMA_REGISTRY = new Set<ClassConstructor>();

export const SwaggerSchema = (schema: SwaggerSchemaObject): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(SWAGGER_SCHEMA_METADATA_KEY, schema, target);
    SWAGGER_SCHEMA_REGISTRY.add(target as unknown as ClassConstructor);
  };
};

export function applySwaggerSchemas(document: OpenAPIObject) {
  document.components ??= {};
  document.components.schemas ??= {};

  for (const target of SWAGGER_SCHEMA_REGISTRY) {
    const schema = Reflect.getMetadata(SWAGGER_SCHEMA_METADATA_KEY, target) as SwaggerSchemaObject | undefined;
    if (schema) {
      document.components.schemas[target.name] = schema;
    }
  }

  return document;
}
