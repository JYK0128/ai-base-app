import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MemberInvite, MemberInviteStatus } from '@pkg/database';

import { CursorResponseDto, EntityResponseType } from '@/common/interfaces';

export class InviteListItem extends EntityResponseType(MemberInvite) {
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

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7082', description: '초대 식별자' })
  override id!: string;

  @ApiProperty({ example: 'Hana Lee', description: '초대 대상 이름' })
  override name!: string;

  @ApiProperty({ example: 'hana.lee@example.com', description: '초대 대상 이메일' })
  override email!: string;

  @ApiProperty({ enum: MemberInviteStatus, example: MemberInviteStatus.PENDING, description: '초대 상태' })
  override status!: MemberInviteStatus;

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7082', description: '권한 식별자' })
  roleId!: string;

  @ApiProperty({ example: 'MANAGER', description: '권한 코드' })
  roleCode!: string;

  @ApiProperty({ example: '관리자', description: '권한 이름' })
  roleName!: string;

  @ApiPropertyOptional({ example: '초대 메모', description: '초대 메모' })
  override note?: string;

  @ApiProperty({ example: '2026-05-23T08:30:00.000Z', description: '생성 일시' })
  override createdAt!: Date;
}

export class GetInviteListResponseDto extends CursorResponseDto<InviteListItem> {
  constructor(args: CursorResponseDto<InviteListItem>) {
    super();
    this.items = args.items;
    this.startCursor = args.startCursor;
    this.endCursor = args.endCursor;
    this.hasNextPage = args.hasNextPage;
    this.hasPrevPage = args.hasPrevPage;
    this.totalCount = args.totalCount;
    this.length = args.length;
  }

  @ApiProperty({ type: () => [InviteListItem], example: [], description: '초대 이력 목록' })
  items!: InviteListItem[];
}
