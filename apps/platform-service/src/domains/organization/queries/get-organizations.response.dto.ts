import { ApiProperty } from '@nestjs/swagger';
import { Organization, OrganizationStatus } from '@pkg/database';

export class OrganizationResponseDto implements Pick<Organization, 'id' | 'name' | 'createdAt'> {
  constructor(organization: Organization) {
    this.id = organization.id;
    this.name = organization.name;
    this.createdAt = organization.createdAt;
    this.subdomain = organization.code;
    this.status = organization.status;
  }

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7081', description: '조직 식별자' })
  id!: string;

  @ApiProperty({ example: '개발 조직', description: '조직 이름' })
  name!: string;

  @ApiProperty({ example: '2026-06-06T14:00:00.000Z', description: '생성 일시' })
  createdAt!: Date;

  @ApiProperty({ example: 'platform', description: '서브도메인' })
  subdomain!: string;

  @ApiProperty({ enum: OrganizationStatus, example: 'ACTIVE', description: '조직 상태' })
  status!: OrganizationStatus;
}

export class GetOrganizationsResponseDto {
  constructor(list: OrganizationResponseDto[]) {
    this.list = list;
  }

  @ApiProperty({ type: [OrganizationResponseDto], description: '조직 목록' })
  list!: OrganizationResponseDto[];
}
