export type DtoInterface<T extends object> = Partial<T> & {
  [key: string]: unknown
};
