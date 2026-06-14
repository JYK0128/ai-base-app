import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AgreeTermsRequestDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7082', description: '멤버 식별자' })
  @IsUUID()
  memberId!: string;

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7083', description: '동의할 약관 버전 식별자' })
  @IsUUID()
  termsVersionId!: string;
}
