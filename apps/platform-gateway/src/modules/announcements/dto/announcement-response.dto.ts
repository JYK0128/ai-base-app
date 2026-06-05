import { ApiProperty } from '@nestjs/swagger';

export class AnnouncementResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7092', description: '공지사항 식별자' })
  id!: string;

  @ApiProperty({ example: '새 기능이 출시되었습니다', description: '공지사항 제목' })
  title!: string;

  @ApiProperty({ example: '새 기능이 출시되었습니다', description: '공지사항 요약' })
  summary!: string;

  @ApiProperty({ example: '새로운 소식을 안내드립니다...', description: '공지사항 내용' })
  content!: string;

  @ApiProperty({ example: 'NOTICE', enum: ['NOTICE', 'MAINTENANCE', 'SECURITY', 'EVENT'], description: '공지 분류' })
  category!: string;

  @ApiProperty({ example: 'ALL', enum: ['ALL', 'PLATFORM', 'ORGANIZATION'], description: '공지 대상' })
  audience!: string;

  @ApiProperty({ example: 'IN_APP', enum: ['IN_APP', 'EMAIL', 'PUSH'], description: '공지 채널' })
  channel!: string;

  @ApiProperty({ example: 'NORMAL', enum: ['LOW', 'NORMAL', 'HIGH'], description: '공지 우선순위' })
  priority!: string;

  @ApiProperty({ example: 'PUBLISHED', enum: ['DRAFT', 'PUBLISHED'], description: '게시 상태' })
  status!: string;

  @ApiProperty({ example: true, description: '게시 여부' })
  isPublished!: boolean;

  @ApiProperty({ example: false, description: '상단 고정 여부' })
  pinned!: boolean;

  @ApiProperty({ example: 'admin@platform.com', description: '작성자' })
  author!: string;

  @ApiProperty({ example: '2026-06-01T09:00:00.000Z', description: '게시 시작일' })
  startAt!: string;

  @ApiProperty({ example: '2026-06-07T09:00:00.000Z', description: '게시 종료일' })
  endAt!: string;

  @ApiProperty({ example: '2024-05-10T00:00:00Z', description: '생성 일시' })
  createdAt!: string;

  @ApiProperty({ example: '2024-05-11T00:00:00Z', description: '수정 일시' })
  updatedAt!: string;
}
