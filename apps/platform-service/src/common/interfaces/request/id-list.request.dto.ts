import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export abstract class IdListRequestDto<_TEntity extends object> {
  @ApiProperty({ example: ['019e5236-adae-70d7-a8f7-2dc90bdf7081', '019e5236-adae-70d7-a8f7-2dc90bdf7082'], type: String, isArray: true, description: '식별자 목록' })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => String)
  @IsUUID(undefined, { each: true })
  ids!: string[];
}
