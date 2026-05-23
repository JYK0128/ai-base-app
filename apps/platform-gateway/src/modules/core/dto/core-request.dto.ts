import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({ example: '새 기능이 출시되었습니다', description: '공지사항 제목' })
  title!: string;

  @ApiProperty({ example: '새로운 소식을 안내드립니다...', description: '공지사항 내용' })
  content!: string;

  @ApiPropertyOptional({ example: true, description: '즉시 게시 여부' })
  isPublished?: boolean;
}

export class GetOrganizationsQueryDto {
  @ApiPropertyOptional({ example: 'APPROVED', enum: ['PENDING', 'APPROVED', 'REJECTED', 'DORMANT'], description: '조직 상태 필터' })
  status?: string;
}

export class GetAnnouncementsQueryDto {
  @ApiPropertyOptional({ example: false, description: '게시된 공지사항만 조회 여부' })
  isPublishedOnly?: boolean;
}

export class GetTicketsQueryDto {
  @ApiPropertyOptional({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7088', description: '조직 식별자 필터' })
  organizationId?: string;

  @ApiPropertyOptional({ example: 'OPEN', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], description: '티켓 상태 필터' })
  status?: string;
}

export class GetTermsQueryDto {
  @ApiPropertyOptional({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7088', description: '조직 식별자' })
  organizationId?: string;
}

export class CreateTermsDocumentDto {
  @ApiProperty({ example: 'SERVICE_TOS', description: '약관 문서 코드' })
  code!: string;

  @ApiProperty({ example: '서비스 이용약관', description: '약관 문서 제목' })
  title!: string;

  @ApiPropertyOptional({ example: true, description: '필수 약관 여부' })
  required?: boolean;

  @ApiPropertyOptional({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7088', description: '조직 식별자' })
  organizationId?: string;
}

export class CreateTermsVersionDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7089', description: '약관 문서 식별자' })
  termsDocumentId!: string;

  @ApiProperty({ example: 'v1.0.0', description: '약관 버전 라벨' })
  label!: string;

  @ApiProperty({ example: '약관 본문 내용(마크다운 등)...', description: '약관 본문' })
  content!: string;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z', description: '효력 시작일' })
  effectiveFrom?: Date;

  @ApiPropertyOptional({ example: '9999-12-31T23:59:59Z', description: '효력 종료일' })
  effectiveTo?: Date;

  @ApiPropertyOptional({ example: 'DRAFT', enum: ['DRAFT', 'PUBLISHED', 'DEPRECATED'], description: '버전 상태' })
  status?: string;
}

export class AgreeTermsDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7090', description: '매니저 식별자' })
  managerId!: string;

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7091', description: '동의할 약관 버전 식별자' })
  termsVersionId!: string;

  @ApiPropertyOptional({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7088', description: '조직 식별자' })
  organizationId?: string;

  @ApiPropertyOptional({ example: 'WEB', description: '동의 소스' })
  source?: string;

  @ApiPropertyOptional({ example: '127.0.0.1', description: '클라이언트 접속 주소' })
  ipAddress?: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0', description: '브라우저 정보' })
  userAgent?: string;
}

export class OrganizationParamDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7088', description: '조직 식별자' })
  @IsUUID()
  id!: string;
}
