import { ApiProperty } from '@nestjs/swagger';
import { Member, MemberStatus } from '@pkg/database';

import { EntityResponseType } from '@/common/interfaces';
export class GetMemberResponseDto extends EntityResponseType(Member) {
  constructor(member: Member) {
    super();
    const accounts = member.accounts.getItems();
    const roleAssignments = member.roles.getItems();
    const roleCodes = roleAssignments.map((ra) => ra.role.code);
    const lastLoginAt = accounts
      .filter((item) => item.lastLoginAt)
      .toSorted((a, b) => (b.lastLoginAt?.getTime() ?? 0) - (a.lastLoginAt?.getTime() ?? 0))
      .at(0)?.lastLoginAt;
    this.id = member.id;
    this.name = member.name;
    this.email = member.email;
    this.status = member.status;
    this.roles = roleCodes.length > 0 ? roleCodes : null;
    this.lastLoginAt = lastLoginAt ?? null;
    this.createdAt = member.createdAt;
  }

  @ApiProperty({ type: String, description: '멤버 식별자' })
  override id!: string;

  @ApiProperty({ type: String, description: '멤버 이름' })
  override name!: string;

  @ApiProperty({ type: String, description: '이메일' })
  override email!: string;

  @ApiProperty({ enum: MemberStatus, description: '멤버 상태' })
  override status!: MemberStatus;

  @ApiProperty({ type: String, isArray: true, nullable: true, description: '권한 목록' })
  override roles!: string[] | null;

  @ApiProperty({ type: String, nullable: true, description: '최근 로그인' })
  lastLoginAt!: Date | null;

  @ApiProperty({ type: String, description: '생성 일시' })
  override createdAt!: Date;
}
