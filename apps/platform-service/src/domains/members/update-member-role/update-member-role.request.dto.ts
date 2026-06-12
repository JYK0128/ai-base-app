import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UpdateMemberRoleRequestDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', description: '멤버 식별자' })
  @IsUUID()
  id!: string;

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7091', description: '변경할 역할 식별자' })
  @IsUUID()
  roleId!: string;
}
