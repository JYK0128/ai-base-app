export const SortDirection = {
  ASC: 'asc',
  DESC: 'desc',
} as const;
export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection];
export type SortKey<TEntity extends object> = Extract<keyof TEntity, string>;

export interface SortPairRequestDto<TEntity extends object> {
  sort: Array<SortKey<TEntity>>
  direction: SortDirection[]
}
