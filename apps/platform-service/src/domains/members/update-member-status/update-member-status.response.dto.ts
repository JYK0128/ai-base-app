import { ApiProperty } from '@nestjs/swagger';

export class UpdateMemberStatusResponseDto {
  constructor(id: string) {
    this.id = id;
  }

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', description: '멤버 식별자' })
  id!: string;
}
