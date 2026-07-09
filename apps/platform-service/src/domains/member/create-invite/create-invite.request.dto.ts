import { ApiProperty } from '@nestjs/swagger';
import { MemberInvite } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsEmail, IsString, IsUUID } from 'class-validator';

import { IsNotEmptyString } from '@/common/decorators/is-not-empty-string.decorator';
import { EntityRequestType } from '@/common/interfaces';

export class CreateInviteRequestDto extends EntityRequestType(MemberInvite) {
  @ApiProperty({ example: '김개발', type: String, description: '초대할 사람 이름' })
  @Type(() => String)
  @IsNotEmptyString({ message: '이름은 공백만으로 구성될 수 없습니다.' })
  override name!: string;

  @ApiProperty({ example: 'dev@example.com', type: String, description: '초대할 사람 이메일' })
  @Type(() => String)
  @IsEmail()
  override email!: string;

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7091', type: String, description: '부여할 역할' })
  @Type(() => String)
  @IsUUID()
  override role!: string;

  @ApiProperty({ example: '프로젝트 초대', type: String, nullable: true, description: '메모/메모사항' })
  @Type(() => String)
  @IsString()
  override note!: string | null;
}
