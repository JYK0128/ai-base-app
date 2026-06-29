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

    if (roleCodes.length > 0) {
      this.roles = roleCodes;
    }
    if (lastLoginAt) {
      this.lastLoginAt = lastLoginAt;
    }
    this.createdAt = member.createdAt;
  }

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7082', description: '멤버 식별자' })
  override id!: string;

  @ApiProperty({ example: '김개발', description: '멤버 이름' })
  override name!: string;

  @ApiProperty({ example: 'hana.lee@example.com', description: '이메일' })
  override email!: string;

  @ApiProperty({ enum: MemberStatus, example: MemberStatus.ACTIVE, description: '멤버 상태' })
  override status!: MemberStatus;

  @ApiProperty({ example: ['MANAGER'], isArray: true, type: String, description: '권한 목록' })
  override roles?: string[];

  @ApiProperty({ example: '2026-05-23T10:11:12.000Z', nullable: true, description: '최근 로그인' })
  lastLoginAt?: Date;

  @ApiProperty({ example: '2026-05-23T08:30:00.000Z', description: '생성 일시' })
  override createdAt!: Date;
}
