import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';

export abstract class IdRequestDto<_TEntity extends object> {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7081', type: String, description: '식별자' })
  @Type(() => String)
  @IsUUID()
  id!: string;
}
