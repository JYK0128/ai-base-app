import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiPropertyOptional({ example: 'announcement-001', description: '공지사항 식별자' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: '새 기능이 출시되었습니다', description: '공지사항 제목' })
  @IsString()
  title!: string;

  @ApiProperty({ example: '새로운 소식을 안내드립니다...', description: '공지사항 내용' })
  @IsString()
  content!: string;

  @ApiPropertyOptional({ example: 'NOTICE', enum: ['NOTICE', 'MAINTENANCE', 'SECURITY', 'EVENT'], description: '공지 분류' })
  @IsOptional()
  @IsIn(['NOTICE', 'MAINTENANCE', 'SECURITY', 'EVENT'])
  category?: string;

  @ApiPropertyOptional({ example: 'ALL', enum: ['ALL', 'PLATFORM', 'ORGANIZATION'], description: '공지 대상' })
  @IsOptional()
  @IsIn(['ALL', 'PLATFORM', 'ORGANIZATION'])
  audience?: string;

  @ApiPropertyOptional({ example: 'IN_APP', enum: ['IN_APP', 'EMAIL', 'PUSH'], description: '공지 채널' })
  @IsOptional()
  @IsIn(['IN_APP', 'EMAIL', 'PUSH'])
  channel?: string;

  @ApiPropertyOptional({ example: 'NORMAL', enum: ['LOW', 'NORMAL', 'HIGH'], description: '공지 우선순위' })
  @IsOptional()
  @IsIn(['LOW', 'NORMAL', 'HIGH'])
  priority?: string;

  @ApiPropertyOptional({ example: 'PUBLISHED', enum: ['DRAFT', 'PUBLISHED'], description: '게시 상태' })
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED'])
  status?: string;

  @ApiPropertyOptional({ example: false, description: '상단 고정 여부' })
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @ApiPropertyOptional({ example: '2026-06-01T09:00:00.000Z', description: '게시 시작일' })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({ example: '2026-06-07T09:00:00.000Z', description: '게시 종료일' })
  @IsOptional()
  @IsDateString()
  endAt?: string;
}

export class GetAnnouncementsQueryDto {
  @ApiPropertyOptional({ example: false, description: '게시된 공지사항만 조회 여부' })
  @IsOptional()
  @IsBoolean()
  isPublishedOnly?: boolean;
}
