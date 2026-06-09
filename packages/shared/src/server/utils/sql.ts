import { raw } from '@mikro-orm/postgresql';

type JsonObject = Record<string, unknown>;

type DeepPartialJson<T> = T extends object
  ? {
    [K in keyof T]?: DeepPartialJson<T[K]>;
  }
  : T;

function flattenJsonPatch(
  obj: JsonObject,
  prefix: string[] = [],
): Array<{
  path: string[]
  value: unknown
}> {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = [...prefix, key];

    if (
      value !== null
      && typeof value === 'object'
      && !Array.isArray(value)
    ) {
      return flattenJsonPatch(value as JsonObject, path);
    }

    return [{ path, value }];
  });
}

export function buildJsonbSetQuery<T>() {
  return function<K extends keyof T>(
    columnName: K,
    patch: DeepPartialJson<T[K]>,
  ) {
    const colName = String(columnName);
    const updates = flattenJsonPatch(patch as JsonObject);

    if (updates.length === 0) {
      return raw(`COALESCE(??, '{}'::jsonb)`, [colName]);
    }

    const params: unknown[] = [colName];

    const sql = updates.reduce((acc, { path, value }) => {
      params.push(path);
      params.push(JSON.stringify(value));

      return `jsonb_set(${acc}, ?::text[], ?::jsonb, true)`;
    }, `COALESCE(??, '{}'::jsonb)`);

    return raw(sql, params);
  };
}
