import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { InviteStatusDto, MemberRoleDto, MemberStatusDto } from './members-request.dto';

export class MemberResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7097', description: '멤버 식별자' })
  id!: string;

  @ApiProperty({ example: 'Hana Lee', description: '이름' })
  name!: string;

  @ApiProperty({ example: 'hana.lee@example.com', description: '이메일' })
  email!: string;

  @ApiProperty({ enum: MemberRoleDto, example: 'MANAGER', description: '권한' })
  role!: MemberRoleDto;

  @ApiProperty({ enum: MemberStatusDto, example: 'ACTIVE', description: '멤버 상태' })
  status!: MemberStatusDto;

  @ApiProperty({ example: '2026-05-23T10:11:12.000Z', nullable: true, description: '최근 로그인' })
  lastLoginAt!: string | null;

  @ApiProperty({ example: '2026-05-23T08:30:00.000Z', description: '초대 일시' })
  invitedAt!: string;

  @ApiProperty({ example: 'admin@example.com', description: '초대한 사람' })
  invitedBy!: string;

  @ApiPropertyOptional({ example: '디자인팀 합류 예정', description: '메모' })
  note?: string;

  @ApiProperty({ example: false, description: '현재 사용자 여부' })
  isMe?: boolean;
}

export class InviteResponseDto extends MemberResponseDto {
  @ApiProperty({ example: '2026-05-30T08:30:00.000Z', description: '만료 일시' })
  expiresAt!: string;

  @ApiProperty({ enum: InviteStatusDto, example: 'PENDING', description: '초대 상태' })
  inviteStatus!: InviteStatusDto;
}

export class MemberMutationResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', description: '주요 식별자' })
  id!: string;
}
