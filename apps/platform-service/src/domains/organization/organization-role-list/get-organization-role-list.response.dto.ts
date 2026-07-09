import { ApiProperty } from '@nestjs/swagger';
import { OrganizationRole } from '@pkg/database';

import { EntityResponseType, ListResponseDto } from '@/common/interfaces';
export class OrganizationRoleListItem extends EntityResponseType(OrganizationRole) {
  constructor(role: OrganizationRole) {
    super();
    this.id = role.id;
    this.code = role.code;
    this.name = role.name;
    this.description = role.description;
    this.sortOrder = role.sortOrder;
  }

  @ApiProperty({ type: String, description: '조직 역할 식별자' })
  override id!: string;

  @ApiProperty({ type: String, description: '조직 역할 코드' })
  override code!: string;

  @ApiProperty({ type: String, description: '조직 역할 이름' })
  override name!: string;

  @ApiProperty({ type: String, nullable: true, description: '조직 역할 설명' })
  override description!: string | null;

  @ApiProperty({ type: Number, nullable: true, description: '조직 역할 정렬 순서' })
  override sortOrder!: number | null;
}
export class GetOrganizationRoleListResponseDto extends ListResponseDto<OrganizationRoleListItem> {
  constructor(args: GetOrganizationRoleListResponseDto) {
    super();
    this.items = args.items;
  }

  @ApiProperty({ type: () => [OrganizationRoleListItem], description: '조직 역할 목록' })
  items!: OrganizationRoleListItem[];
}
