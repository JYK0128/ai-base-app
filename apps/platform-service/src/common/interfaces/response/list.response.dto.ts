import { ApiPropertyOptional } from '@nestjs/swagger';

export abstract class ListResponseDto<TEntity extends object> {
  abstract items: TEntity[];

  @ApiPropertyOptional({ description: '조회 시작 오프셋', example: 0 })
  offset?: number;

  @ApiPropertyOptional({ description: '조회 개수 제한', example: 20 })
  limit?: number;
}
