import { ApiProperty } from '@nestjs/swagger';

export abstract class AffectedRowsResponseDto<_TEntity extends object> {
  @ApiProperty({ description: '영향을 받은 행 수' })
  affectedRows!: number;
}
