import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type Member, MemberStatus } from '@pkg/database';

import type { EntityResponseDto } from '@/common/interfaces';
import type { MemberRoleDto } from '@/domains/members/members.types';

export class MemberResponseDto implements EntityResponseDto<Member> {
  constructor(member: Member) {
    const account = member.accounts.getItems()[0];
    const roleAssignment = member.organizationRoles.getItems()[0];

    this.id = member.id;
    this.name = member.name;
    this.status = member.status;
    if (member.createdBy) {
      this.createdBy = member.createdBy;
    }
    this.email = account?.email ?? '';
    this.role = (roleAssignment?.role.code ?? '') as MemberRoleDto;
    this.lastLoginAt = account?.lastLoginAt?.toISOString() ?? null;
    this.invitedAt = member.createdAt.toISOString();
  }

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7082', description: '멤버 식별자' })
  id!: string;

  @ApiProperty({ example: '김개발', description: '멤버 이름' })
  name!: string;

  @ApiProperty({ enum: MemberStatus, example: 'ACTIVE', description: '멤버 상태' })
  status!: MemberStatus;

  @ApiPropertyOptional({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7081', description: '생성자 식별자' })
  createdBy?: string;

  @ApiProperty({ example: 'hana.lee@example.com', description: '이메일' })
  email!: string;

  @ApiProperty({ example: 'MANAGER', description: '권한' })
  role!: MemberRoleDto;

  @ApiProperty({ example: '2026-05-23T10:11:12.000Z', nullable: true, description: '최근 로그인' })
  lastLoginAt!: string | null;

  @ApiProperty({ example: '2026-05-23T08:30:00.000Z', description: '초대 일시 (생성 시각 기준)' })
  invitedAt!: string;
}
