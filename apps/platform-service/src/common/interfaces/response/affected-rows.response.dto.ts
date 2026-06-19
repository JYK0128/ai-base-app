export type AffectedRowsResponseDto<_TEntity extends object>
  = object
    & {
      affectedRows: number
    };
