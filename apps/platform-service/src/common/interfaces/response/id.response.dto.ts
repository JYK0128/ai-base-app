import { ApiProperty } from '@nestjs/swagger';

export abstract class IdResponseDto<_TEntity extends object> {
  @ApiProperty({ description: '식별자' })
  id!: string;
}
