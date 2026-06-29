import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationRole } from '@pkg/database';

import { EntityResponseType, ListResponseDto } from '@/common/interfaces';

export class OrganizationRoleListItem extends EntityResponseType(OrganizationRole) {
  constructor(role: OrganizationRole) {
    super();
    this.id = role.id;
    this.code = role.code;
    this.name = role.name;
    this.description = role.description ?? '';
  }

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7102', description: '조직 역할 식별자' })
  override id!: string;

  @ApiProperty({ example: 'OWNER', description: '조직 역할 코드' })
  override code!: string;

  @ApiProperty({ example: '조직 관리자', description: '조직 역할 이름' })
  override name!: string;

  @ApiPropertyOptional({ example: '조직 전체를 관리할 수 있는 역할입니다.', description: '조직 역할 설명' })
  override description?: string;
}

export class GetOrganizationRoleListResponseDto extends ListResponseDto<OrganizationRoleListItem> {
  constructor(args: ListResponseDto<OrganizationRoleListItem>) {
    super();
    this.items = args.items;
    this.offset = args.offset;
    this.limit = args.limit;
  }

  @ApiProperty({
    type: () => [OrganizationRoleListItem],
    example: [],
    description: '조직 역할 목록',
  })
  items!: OrganizationRoleListItem[];
}
