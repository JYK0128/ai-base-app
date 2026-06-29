export const SortDirection = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection];
export type SortKey<TEntity extends object> = Extract<keyof TEntity, string>;

export abstract class SortableRequestDto<
  TEntity extends object,
  TSortKey extends string = SortKey<TEntity>,
> {
  abstract sort: TSortKey[];
  abstract direction: SortDirection[];

  protected toOrderBy(): Record<string, 'asc' | 'desc'> {
    return this.sort.reduce<Record<string, 'asc' | 'desc'>>((acc, field, index) => {
      acc[field] = this.direction[index] as 'asc' | 'desc';
      return acc;
    }, {});
  }
}
