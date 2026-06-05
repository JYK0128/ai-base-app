export const defineKeys = <Key extends PropertyKey>() =>
  <const T extends readonly Key[]>(
    keys: Key extends T[number] ? T : never,
  ) => keys;
