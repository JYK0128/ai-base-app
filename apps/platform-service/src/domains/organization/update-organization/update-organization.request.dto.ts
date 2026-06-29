import { ApiProperty } from '@nestjs/swagger';
import { Organization } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsEmail } from 'class-validator';

import { IsNotEmptyString } from '@/common/decorators';
import { EntityRequestType } from '@/common/interfaces';

export class UpdateOrganizationRequestDto extends EntityRequestType(Organization) {
  @ApiProperty({ example: '아이베이스 플랫폼', description: '조직 이름' })
  @Type(() => String)
  @IsNotEmptyString({ message: '조직 이름은 공백만으로 구성될 수 없습니다.' })
  override name!: string;

  @ApiProperty({ example: 'owner@ibase.example', description: '대표 이메일' })
  @Type(() => String)
  @IsEmail()
  override email!: string;
}
