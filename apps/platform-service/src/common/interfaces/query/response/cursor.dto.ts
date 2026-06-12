import type { Type } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export function withQueryCursorResponse<TBase extends Type>(_Base: TBase) {
  abstract class MixinClass {
    @ApiProperty({
      description: '응답 항목',
      type: Object,
      isArray: true,
    })
    items!: Partial<InstanceType<TBase>>[];

    @ApiPropertyOptional({
      description: '다음 커서',
    })
    nextCursor?: string;

    @ApiPropertyOptional({
      description: '이전 커서',
    })
    prevCursor?: string;

    @ApiProperty({
      description: '다음 페이지 존재 여부',
    })
    hasNextPage!: boolean;

    @ApiProperty({
      description: '이전 페이지 존재 여부',
    })
    hasPrevPage!: boolean;

    @ApiPropertyOptional({
      description: '전체 개수',
      example: 0,
    })
    totalCount?: number;
  }

  return MixinClass;
}

export type QueryCursorResponse<TEntity extends Type>
  = ReturnType<typeof withQueryCursorResponse<TEntity>>;
