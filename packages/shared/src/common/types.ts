/**
 * Removes index signatures (e.g., [key: string]: any) from a type.
 */
export type StripIndex<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
      ? never
      : symbol extends K
        ? never
        : K]: T[K];
};

/**
 * Converts Date types within a type to string.
 */
export type SerializeDate<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends Date | null
      ? string | null
      : T[K] extends Date | undefined
        ? string | undefined
        : T[K] extends Date | null | undefined
          ? string | null | undefined
          : T[K];
};
/**
 * Preserves the generic type information of T.
 */
export type Prettify<T> = {
  [P in keyof T]: T[P];
} & {};

/**
 * Strips index signatures and serializes Date properties to string.
 */
export type Plain<T> = Prettify<SerializeDate<StripIndex<T>>>;

/**
 * Pick properties of T that are primitive types.
 */
type Primitive = string | number | boolean | symbol | bigint | Date | null | undefined;

type PrimitiveKeys<T> = {
  [K in keyof T]: T[K] extends Primitive ? K : never;
}[keyof T];

export type PickPrimitive<T, K extends PrimitiveKeys<T> = PrimitiveKeys<T>> = Prettify<Pick<T, K>>;
