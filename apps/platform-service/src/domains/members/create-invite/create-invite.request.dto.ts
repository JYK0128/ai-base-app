import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { MemberInvite, OrganizationRole } from '@pkg/database';
import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

import { IsNotEmptyString } from '@/common/decorators/is-not-empty-string.decorator';
import type { EntityRequestDto } from '@/common/interfaces';

export class CreateInviteRequestDto implements EntityRequestDto<MemberInvite> {
  @ApiProperty({ example: '김개발', description: '초대할 사람 이름' })
  @IsNotEmptyString({ message: '이름은 공백만으로 구성될 수 없습니다.' })
  name!: string;

  @ApiProperty({ example: 'dev@example.com', description: '초대할 사람 이메일' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7091', description: '부여할 역할' })
  @IsUUID()
  role!: OrganizationRole['id'];

  @ApiPropertyOptional({ example: '프로젝트 초대', description: '메모/메모사항' })
  @IsOptional()
  @IsString()
  note?: string;
}
