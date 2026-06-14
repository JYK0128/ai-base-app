type NonNullableValue<T> = Exclude<T, null | undefined>;

type FilterableAtomicValue<T> = NonNullableValue<T> extends Date
  ? Date
  : NonNullableValue<T> extends string | number | boolean | bigint
    ? NonNullableValue<T>
    : never;

type DirectFilterKeys<TEntity extends object> = {
  [K in keyof TEntity]-?: FilterableAtomicValue<TEntity[K]> extends never ? never : K
}[keyof TEntity];

type DateFilterKeys<TEntity extends object> = {
  [K in keyof TEntity]-?: NonNullableValue<TEntity[K]> extends Date ? K : never
}[keyof TEntity];

type StringKey<K> = K extends string ? K : never;

export type FilterRequestDto<TEntity extends object> = {
  [K in StringKey<DirectFilterKeys<TEntity>>]?: FilterableAtomicValue<TEntity[K]> | Array<FilterableAtomicValue<TEntity[K]>>
} & {
  [K in StringKey<DateFilterKeys<TEntity>> as `${K}Range`]?: [Date, Date]
};
