import { ApiPropertyOptional } from '@nestjs/swagger';
import { Organization } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsEmail, IsOptional } from 'class-validator';

import { IsNotEmptyString } from '@/common/decorators';
import { EntityRequestType } from '@/common/interfaces';

export class UpdateOrganizationRequestDto extends EntityRequestType(Organization) {
  @ApiPropertyOptional({ example: '아이베이스 플랫폼', type: String, description: '조직 이름' })
  @IsOptional()
  @Type(() => String)
  @IsNotEmptyString({ message: '조직 이름은 공백만으로 구성될 수 없습니다.' })
  override name?: string;

  @ApiPropertyOptional({ example: 'owner@ibase.example', type: String, description: '대표 이메일' })
  @IsOptional()
  @Type(() => String)
  @IsEmail()
  override email?: string;
}
