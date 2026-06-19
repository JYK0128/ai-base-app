import { ApiProperty } from '@nestjs/swagger';
import type { Resource } from '@pkg/database';
import { IsUUID } from 'class-validator';

import type { IdRequestDto } from '@/common/interfaces';

export class GetResourceRequestDto implements IdRequestDto<Resource> {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', description: '리소스 식별자' })
  @IsUUID()
  id!: string;
}
