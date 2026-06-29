import { ApiProperty } from '@nestjs/swagger';

export abstract class PageResponseDto<TEntity extends object> {
  abstract items: TEntity[];

  @ApiProperty({ description: '전체 개수', example: 0 })
  totalCount!: number;

  @ApiProperty({ description: '페이지 번호', example: 1 })
  page!: number;

  @ApiProperty({ description: '페이지 크기', example: 20 })
  limit!: number;

  @ApiProperty({ description: '전체 페이지 수', example: 0 })
  totalPages!: number;

  @ApiProperty({ description: '다음 페이지 존재 여부', example: false })
  hasNextPage!: boolean;

  @ApiProperty({ description: '이전 페이지 존재 여부', example: false })
  hasPrevPage!: boolean;
}
