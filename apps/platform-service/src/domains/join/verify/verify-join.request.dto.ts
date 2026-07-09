import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';

import { PayloadRequestDto } from '@/common/interfaces';

export class VerifyJoinRequestDto extends PayloadRequestDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7081', type: String, description: '초대 토큰' })
  @Type(() => String)
  @IsUUID()
  token!: string;
}
