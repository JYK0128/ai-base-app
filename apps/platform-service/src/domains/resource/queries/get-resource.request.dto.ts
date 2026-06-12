import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetResourceRequestDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', description: '리소스 식별자' })
  @IsUUID()
  id!: string;
}
