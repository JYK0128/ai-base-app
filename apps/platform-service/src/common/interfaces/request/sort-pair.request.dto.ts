export const SortDirection = {
  ASC: 'asc',
  DESC: 'desc',
} as const;
export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection];

export interface SortPairRequestDto<TEntity extends object> {
  sort: Array<Extract<keyof TEntity, string>>
  direction: SortDirection[]
}
