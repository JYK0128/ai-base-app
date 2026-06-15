import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationRole } from '@pkg/database';

import type { EntityResponseDto } from '@/common/interfaces';

export class GetOrganizationRoleResponseDto implements EntityResponseDto<OrganizationRole> {
  constructor(role: OrganizationRole) {
    this.id = role.id;
    this.code = role.code;
    this.name = role.name;
    this.description = role.description ?? '';
  }

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7102', description: '조직 역할 식별자' })
  id!: string;

  @ApiProperty({ example: 'OWNER', description: '조직 역할 코드' })
  code!: string;

  @ApiProperty({ example: '조직 관리자', description: '조직 역할 이름' })
  name!: string;

  @ApiPropertyOptional({ example: '조직 전체를 관리할 수 있는 역할입니다.', description: '조직 역할 설명' })
  description?: string;
}
