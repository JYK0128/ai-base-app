import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationRole } from '@pkg/database';

import type { EntityResponseDto } from '@/common/interfaces';

export class GetPermissionSetResponseDto implements EntityResponseDto<OrganizationRole> {
  constructor(role: OrganizationRole) {
    this.id = role.id;
    this.code = role.code;
    this.name = role.name;
    this.description = role.description ?? undefined;
    this.permissions = Array.from(
      new Set(
        role.permissions
          .getItems()
          .map(
            (permission) => `${permission.resource.code}:${permission.action}`,
          ),
      ),
    ).sort((left, right) => left.localeCompare(right));
  }

  @ApiProperty({
    example: '019e5236-adae-70d7-a8f7-2dc90bdf7102',
    description: '권한 세트 식별자',
  })
  id!: string;

  @ApiProperty({ example: 'SUPER_ADMIN', description: '권한 세트 코드' })
  code!: string;

  @ApiProperty({ example: '플랫폼 전체 권한', description: '권한 세트 이름' })
  name!: string;

  @ApiPropertyOptional({
    example:
      '시스템 내 모든 최상위 리소스 및 자원에 대한 접근과 제어 권한을 가집니다.',
    description: '권한 세트 설명',
  })
  description?: string;

  @ApiProperty({
    type: String,
    isArray: true,
    example: ['DASHBOARD:READ', 'RESOURCE:READ'],
    description: '권한 코드 목록',
  })
  permissions!: string[];
}
