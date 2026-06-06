import { ApiProperty } from '@nestjs/swagger';
import { Organization, OrganizationStatus } from '@pkg/database';

export class OrganizationResponseDto implements Pick<Organization, 'id' | 'name' | 'createdAt'> {
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
