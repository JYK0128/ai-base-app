import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationRole } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsOptional, IsUUID, Matches } from 'class-validator';

import { IsNotEmptyString } from '@/common/decorators';
import { EntityRequestType } from '@/common/interfaces';

const ORGANIZATION_ROLE_CODE_PATTERN = /^[A-Z_]+$/;

export class UpdateOrganizationRoleRequestDto extends EntityRequestType(OrganizationRole) {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7102', type: String, description: '조직 역할 식별자' })
  @Type(() => String)
  @IsUUID()
  override id!: string;

  @ApiPropertyOptional({ example: 'AUDITOR', type: String, description: '조직 역할 코드' })
  @IsOptional()
  @Type(() => String)
  @Matches(ORGANIZATION_ROLE_CODE_PATTERN, { message: '조직 역할 코드는 영문 대문자와 언더바만 사용할 수 있습니다.' })
  override code?: string;

  @ApiPropertyOptional({ example: '감사자', type: String, description: '조직 역할 이름' })
  @IsOptional()
  @Type(() => String)
  @IsNotEmptyString({ message: '조직 역할 이름은 공백만으로 구성될 수 없습니다.' })
  override name?: string;

  @ApiPropertyOptional({ example: '조직 데이터를 감사하는 역할입니다.', type: String, description: '조직 역할 설명' })
  @IsOptional()
  @Type(() => String)
  override description?: string;
}
