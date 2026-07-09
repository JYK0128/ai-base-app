import { ApiProperty } from '@nestjs/swagger';
import { OrganizationRole } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsInt, Matches } from 'class-validator';

import { IsNotEmptyString } from '@/common/decorators';
import { EntityRequestType } from '@/common/interfaces';

const ORGANIZATION_ROLE_CODE_PATTERN = /^[A-Z_]+$/;

export class CreateOrganizationRoleRequestDto extends EntityRequestType(OrganizationRole) {
  @ApiProperty({ example: 'AUDITOR', type: String, description: '조직 역할 코드' })
  @Type(() => String)
  @Matches(ORGANIZATION_ROLE_CODE_PATTERN, { message: '조직 역할 코드는 영문 대문자와 언더바만 사용할 수 있습니다.' })
  override code!: string;

  @ApiProperty({ example: '감사자', type: String, description: '조직 역할 이름' })
  @Type(() => String)
  @IsNotEmptyString({ message: '조직 역할 이름은 공백만으로 구성될 수 없습니다.' })
  override name!: string;

  @ApiProperty({ example: '조직 데이터를 감사하는 역할입니다.', type: String, description: '조직 역할 설명' })
  @Type(() => String)
  override description!: string;

  @ApiProperty({ example: 4, type: Number, nullable: true, description: '조직 역할 정렬 순서' })
  @Type(() => Number)
  @IsInt()
  override sortOrder!: number | null;
}
