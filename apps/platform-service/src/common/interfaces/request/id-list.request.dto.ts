import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export abstract class IdListRequestDto<_TEntity extends object> {
  @ApiProperty({ isArray: true, type: String, description: '식별자 목록' })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => String)
  @IsUUID(undefined, { each: true })
  ids!: string[];
}
