import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';

export abstract class IdRequestDto<_TEntity extends object> {
  @ApiProperty({ description: '식별자' })
  @Type(() => String)
  @IsUUID()
  id!: string;
}
