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

export class AnnouncementResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7092', description: '공지사항 식별자' })
  id!: string;

  @ApiProperty({ example: '새 기능이 출시되었습니다', description: '공지사항 제목' })
  title!: string;

  @ApiProperty({ example: '새로운 소식을 안내드립니다...', description: '공지사항 내용' })
  content!: string;

  @ApiProperty({ example: true, description: '게시 여부' })
  isPublished!: boolean;

  @ApiProperty({ example: '2024-05-10T00:00:00Z', description: '생성 일시' })
  createdAt!: string;
}

export class TicketResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7093', description: '티켓 식별자' })
  id!: string;

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7088', description: '조직 식별자' })
  organizationId!: string;

  @ApiProperty({ example: '로그인 문제', description: '티켓 제목' })
  title!: string;

  @ApiProperty({ example: '계정에 로그인할 수 없습니다...', description: '티켓 내용' })
  content!: string;

  @ApiProperty({ example: 'OPEN', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], description: '티켓 상태' })
  status!: string;

  @ApiProperty({ example: 'HIGH', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], description: '우선순위' })
  priority!: string;

  @ApiProperty({ example: '2024-05-10T00:00:00Z', description: '생성 일시' })
  createdAt!: string;
}

export class TermsDocumentResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7094', description: '약관 문서 식별자' })
  id!: string;

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7088', nullable: true, description: '조직 식별자' })
  organizationId!: string | null;

  @ApiProperty({ example: 'SERVICE_TOS', description: '약관 문서 코드' })
  code!: string;

  @ApiProperty({ example: '서비스 이용약관', description: '약관 제목' })
  title!: string;

  @ApiProperty({ example: true, description: '필수 약관 여부' })
  required!: boolean;

  @ApiProperty({ example: 'PUBLISHED', enum: ['DRAFT', 'PUBLISHED', 'DEPRECATED'], description: '문서 상태' })
  status!: string;
}

export class TermsVersionResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7095', description: '약관 버전 식별자' })
  id!: string;

  @ApiProperty({ example: 'v1.0.0', description: '버전 라벨' })
  versionLabel!: string;

  @ApiProperty({ example: '약관 본문 내용...', description: '약관 본문' })
  content!: string;

  @ApiProperty({ example: 'PUBLISHED', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], description: '버전 상태' })
  status!: string;
}

export class ManagerTermsConsentResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7096', description: '동의 이력 식별자' })
  id!: string;

  @ApiProperty({ example: true, description: '동의 여부' })
  agreed!: boolean;

  @ApiProperty({ example: '2026-05-11T00:00:00Z', description: '동의 일시' })
  agreedAt!: string;
}
