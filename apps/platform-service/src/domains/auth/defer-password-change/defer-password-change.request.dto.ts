import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DeferPasswordChangeRequestDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7081', description: '계정 식별자' })
  @IsUUID()
  accountId!: string;
}
