import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ApproveOrganizationRequestDto {
  @ApiProperty({ example: true, description: '승인 여부' })
  @IsBoolean()
  approve!: boolean;
}
