import { ApiProperty } from '@nestjs/swagger';

export class OrganizationResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7088', description: '조직 식별자' })
  id!: string;

  @ApiProperty({ example: '좋은회사', description: '조직명' })
  name!: string;

  @ApiProperty({ example: 'platform', description: '서브도메인' })
  subdomain!: string;

  @ApiProperty({ example: 'APPROVED', enum: ['PENDING', 'APPROVED', 'REJECTED', 'DORMANT'], description: '조직 상태' })
  status!: string;

  @ApiProperty({ example: '2024-05-10T00:00:00Z', description: '생성 일시' })
  createdAt!: string;
}
