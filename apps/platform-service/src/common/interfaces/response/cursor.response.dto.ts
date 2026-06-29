import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export abstract class CursorResponseDto<TEntity extends object> {
  abstract items: TEntity[];

  @ApiPropertyOptional({ description: '시작 커서', nullable: true, type: String })
  startCursor!: string | null;

  @ApiPropertyOptional({ description: '종료 커서', nullable: true, type: String })
  endCursor!: string | null;

  @ApiProperty({ description: '다음 페이지 존재 여부', example: false })
  hasNextPage!: boolean;

  @ApiProperty({ description: '이전 페이지 존재 여부', example: false })
  hasPrevPage!: boolean;

  @ApiPropertyOptional({ description: '전체 개수', type: Number })
  totalCount!: number | undefined;

  @ApiProperty({ description: '조회된 항목 수', example: 10 })
  length!: number;
}
