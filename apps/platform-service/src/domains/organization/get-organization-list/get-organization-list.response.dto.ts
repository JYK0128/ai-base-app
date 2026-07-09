import { ApiProperty } from '@nestjs/swagger';
import { Organization, OrganizationStatus } from '@pkg/database';

import { EntityResponseType, ListResponseDto } from '@/common/interfaces';
export class OrganizationListItem extends EntityResponseType(Organization) {
  constructor(organization: Organization) {
    super();
    this.id = organization.id;
    this.name = organization.name;
    this.createdAt = organization.createdAt;
    this.code = organization.code;
    this.status = organization.status;
  }

  @ApiProperty({ type: String, description: '조직 식별자' })
  override id!: string;

  @ApiProperty({ type: String, description: '조직 이름' })
  override name!: string;

  @ApiProperty({ type: String, description: '생성 일시' })
  override createdAt!: Date;

  @ApiProperty({ type: String, description: '조직 코드' })
  override code!: string;

  @ApiProperty({ enum: OrganizationStatus, description: '조직 상태' })
  override status!: OrganizationStatus;
}
export class GetOrganizationListResponseDto extends ListResponseDto<OrganizationListItem> {
  constructor(args: GetOrganizationListResponseDto) {
    super();
    this.items = args.items;
  }

  @ApiProperty({ type: () => [OrganizationListItem], description: '조직 목록' })
  items!: OrganizationListItem[];
}
