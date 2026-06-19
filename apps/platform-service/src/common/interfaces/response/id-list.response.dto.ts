export type IdListResponseDto<_TEntity extends object>
  = object
    & {
      ids: string[]
    };
