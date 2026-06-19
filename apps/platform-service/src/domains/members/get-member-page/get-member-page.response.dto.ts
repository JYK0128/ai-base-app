import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type Member, MemberStatus } from '@pkg/database';

import type { EntityResponseDto, PageResponseDto } from '@/common/interfaces';

export class GetMemberPageItemResponseDto implements EntityResponseDto<Member> {
  constructor(member: Member) {
    const accounts = member.accounts.getItems();
    const roleCodes = member.roles.getItems().map((assignment) => assignment.role.code);
    const lastLoginAt = accounts
      .filter((item) => item.lastLoginAt)
      .toSorted((a, b) => (b.lastLoginAt?.getTime() ?? 0) - (a.lastLoginAt?.getTime() ?? 0))
      .at(0)?.lastLoginAt;

    this.id = member.id;
    this.name = member.name;
    this.email = member.email;
    this.status = member.status;

    if (roleCodes.length > 0) {
      this.roles = roleCodes;
    }
    if (lastLoginAt) {
      this.lastLoginAt = lastLoginAt.toISOString();
    }
    this.createdAt = member.createdAt;
  }

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7082', description: '멤버 식별자' })
  id!: string;

  @ApiProperty({ example: '김개발', description: '멤버 이름' })
  name!: string;

  @ApiProperty({ example: 'hana.lee@example.com', description: '이메일' })
  email!: string;

  @ApiProperty({ enum: MemberStatus, example: MemberStatus.ACTIVE, description: '멤버 상태' })
  status!: MemberStatus;

  @ApiPropertyOptional({ example: ['MANAGER'], isArray: true, type: String, description: '권한 목록' })
  roles?: string[];

  @ApiPropertyOptional({ example: '2026-05-23T10:11:12.000Z', description: '최근 로그인' })
  lastLoginAt?: string;

  @ApiProperty({ example: '2026-05-23T08:30:00.000Z', description: '생성 일시' })
  createdAt!: Date;
}

export class GetMemberPageResponseDto implements PageResponseDto<Member> {
  constructor(items: GetMemberPageItemResponseDto[], totalCount: number, page: number, limit: number, totalPages: number, hasNextPage: boolean, hasPrevPage: boolean) {
    this.items = items;
    this.totalCount = totalCount;
    this.page = page;
    this.limit = limit;
    this.totalPages = totalPages;
    this.hasNextPage = hasNextPage;
    this.hasPrevPage = hasPrevPage;
  }

  @ApiProperty({ type: [GetMemberPageItemResponseDto], example: [], description: '멤버 목록' })
  items!: GetMemberPageItemResponseDto[];

  @ApiProperty({ example: 42, description: '전체 개수' })
  totalCount!: number;

  @ApiProperty({ example: 1, description: '페이지 번호' })
  page!: number;

  @ApiProperty({ example: 10, description: '페이지 크기' })
  limit!: number;

  @ApiProperty({ example: 5, description: '전체 페이지 수' })
  totalPages!: number;

  @ApiProperty({ example: true, description: '다음 페이지 존재 여부' })
  hasNextPage!: boolean;

  @ApiProperty({ example: false, description: '이전 페이지 존재 여부' })
  hasPrevPage!: boolean;
}
