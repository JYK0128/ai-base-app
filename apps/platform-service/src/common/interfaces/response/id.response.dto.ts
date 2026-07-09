import { ApiProperty } from '@nestjs/swagger';

export abstract class IdResponseDto<_TEntity extends object> {
  @ApiProperty({ type: String, description: '식별자' })
  id!: string;
}
