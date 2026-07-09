import { ApiProperty } from '@nestjs/swagger';
import { MemberInvite, MemberInviteStatus } from '@pkg/database';

import { EntityResponseType, PageResponseDto } from '@/common/interfaces';
export class InvitePageItem extends EntityResponseType(MemberInvite) {
  constructor(invite: MemberInvite) {
    super();
    const role = invite.role;
    this.id = invite.id;
    this.name = invite.name;
    this.email = invite.email;
    this.status = invite.status;
    this.roleId = role.id;
    this.roleCode = role.code;
    this.roleName = role.name;
    this.note = invite.note;
    this.createdAt = invite.createdAt;
  }

  @ApiProperty({ type: String, description: '초대 식별자' })
  override id!: string;

  @ApiProperty({ type: String, description: '초대 대상 이름' })
  override name!: string;

  @ApiProperty({ type: String, description: '초대 대상 이메일' })
  override email!: string;

  @ApiProperty({ enum: MemberInviteStatus, description: '초대 상태' })
  override status!: MemberInviteStatus;

  @ApiProperty({ type: String, description: '권한 식별자' })
  roleId!: string;

  @ApiProperty({ type: String, description: '권한 코드' })
  roleCode!: string;

  @ApiProperty({ type: String, description: '권한 이름' })
  roleName!: string;

  @ApiProperty({ type: String, nullable: true, description: '초대 메모' })
  override note!: string | null;

  @ApiProperty({ type: String, description: '생성 일시' })
  override createdAt!: Date;
}
export class GetInvitePageResponseDto extends PageResponseDto<InvitePageItem> {
  constructor(args: PageResponseDto<InvitePageItem>) {
    super();
    this.items = args.items;
    this.totalCount = args.totalCount;
    this.page = args.page;
    this.totalPages = args.totalPages;
    this.hasNextPage = args.hasNextPage;
    this.hasPrevPage = args.hasPrevPage;
  }

  @ApiProperty({ type: () => [InvitePageItem], description: '초대 이력 목록' })
  items!: InvitePageItem[];
}
