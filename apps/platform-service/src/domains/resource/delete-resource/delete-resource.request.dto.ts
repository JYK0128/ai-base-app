import { ApiProperty } from '@nestjs/swagger';
import { Resource } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';

import { EntityRequestType } from '@/common/interfaces';

export class DeleteResourceRequestDto extends EntityRequestType(Resource) {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', type: String, description: '리소스 식별자' })
  @Type(() => String)
  @IsUUID()
  override id!: string;
}
