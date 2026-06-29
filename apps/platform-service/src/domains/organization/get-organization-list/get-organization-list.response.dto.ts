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

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7081', description: '조직 식별자' })
  override id!: string;

  @ApiProperty({ example: '개발 조직', description: '조직 이름' })
  override name!: string;

  @ApiProperty({ example: '2026-06-06T14:00:00.000Z', description: '생성 일시' })
  override createdAt!: Date;

  @ApiProperty({ example: 'platform', description: '조직 코드' })
  override code!: string;

  @ApiProperty({ enum: OrganizationStatus, example: OrganizationStatus.ACTIVE, description: '조직 상태' })
  override status!: OrganizationStatus;
}

export class GetOrganizationListResponseDto extends ListResponseDto<OrganizationListItem> {
  constructor(args: ListResponseDto<OrganizationListItem>) {
    super();
    this.items = args.items;
    this.offset = args.offset;
    this.limit = args.limit;
  }

  @ApiProperty({ type: () => [OrganizationListItem], example: [], description: '조직 목록' })
  items!: OrganizationListItem[];
}
