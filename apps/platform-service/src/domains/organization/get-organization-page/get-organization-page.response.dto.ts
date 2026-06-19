import { ApiProperty } from '@nestjs/swagger';
import { Organization, OrganizationStatus } from '@pkg/database';

import type { EntityResponseDto, ListResponseDto } from '@/common/interfaces';

export class GetOrganizationPageItemResponseDto implements EntityResponseDto<Organization> {
  constructor(organization: Organization) {
    this.id = organization.id;
    this.name = organization.name;
    this.createdAt = organization.createdAt;
    this.code = organization.code;
    this.status = organization.status;
  }

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7081', description: '조직 식별자' })
  id!: string;

  @ApiProperty({ example: '개발 조직', description: '조직 이름' })
  name!: string;

  @ApiProperty({ example: '2026-06-06T14:00:00.000Z', description: '생성 일시' })
  createdAt!: Date;

  @ApiProperty({ example: 'platform', description: '조직 코드' })
  code!: string;

  @ApiProperty({ enum: OrganizationStatus, example: OrganizationStatus.ACTIVE, description: '조직 상태' })
  status!: OrganizationStatus;
}

export class GetOrganizationPageResponseDto implements ListResponseDto<Organization> {
  constructor(items: GetOrganizationPageItemResponseDto[]) {
    this.items = items;
  }

  @ApiProperty({ type: [GetOrganizationPageItemResponseDto], example: [], description: '조직 목록' })
  items!: GetOrganizationPageItemResponseDto[];
}
