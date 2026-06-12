import type { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function withQueryPageResponse<TBase extends Type>(_Base: TBase) {
  abstract class MixinClass {
    @ApiProperty({
      description: '응답 항목',
      type: Object,
      isArray: true,
    })
    items!: Partial<InstanceType<TBase>>[];

    @ApiProperty({
      description: '전체 개수',
      example: 0,
    })
    totalCount!: number;

    @ApiProperty({
      description: '현재 페이지',
      example: 1,
    })
    page!: number;

    @ApiProperty({
      description: '페이지 크기',
      example: 20,
    })
    limit!: number;

    @ApiProperty({
      description: '전체 페이지 수',
      example: 1,
    })
    totalPages!: number;

    @ApiProperty({
      description: '다음 페이지 존재 여부',
    })
    hasNextPage!: boolean;

    @ApiProperty({
      description: '이전 페이지 존재 여부',
    })
    hasPrevPage!: boolean;
  }

  return MixinClass;
}

export type QueryPageResponse<TBase extends Type>
  = InstanceType<ReturnType<typeof withQueryPageResponse<TBase>>>;
