import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Member } from '@pkg/database';

import { InviteStatusDto, MAIL_DELIVERY_STATUS_VALUES, MemberRoleDto, MemberStatusDto } from './members-request.dto';

export class MemberResponseDto implements Pick<Member, 'id' | 'name' | 'status' | 'createdBy'>, Pick<{ note?: string }, 'note'> {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7082', description: '멤버 식별자' })
  id!: string;

  @ApiProperty({ example: '김개발', description: '멤버 이름' })
  name!: string;

  @ApiProperty({ enum: MemberStatusDto, example: 'ACTIVE', description: '멤버 상태' })
  status!: MemberStatusDto;

  @ApiPropertyOptional({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7081', description: '생성자 식별자' })
  createdBy?: string;

  @ApiPropertyOptional({ example: '초대 사유 메모', description: '메모' })
  note?: string;

  @ApiProperty({ example: 'hana.lee@example.com', description: '이메일' })
  email!: string;

  @ApiProperty({ enum: MemberRoleDto, example: 'MANAGER', description: '권한' })
  role!: MemberRoleDto;

  @ApiProperty({ example: '2026-05-23T10:11:12.000Z', nullable: true, description: '최근 로그인' })
  lastLoginAt!: string | null;

  @ApiProperty({ example: '2026-05-23T08:30:00.000Z', description: '초대 일시 (생성 시각 기준)' })
  invitedAt!: string;

  @ApiPropertyOptional({ type: String, enum: MAIL_DELIVERY_STATUS_VALUES, example: 'QUEUED', description: '메일 전송 상태' })
  mailDeliveryStatus?: (typeof MAIL_DELIVERY_STATUS_VALUES)[number];

  @ApiPropertyOptional({ type: String, example: '2026-05-30T08:30:00.000Z', description: '메일 큐 적재 시각' })
  mailDeliveryQueuedAt?: string;

  @ApiPropertyOptional({ type: String, example: '2026-05-30T08:31:00.000Z', description: '메일 전송 성공 시각' })
  mailDeliverySentAt?: string;

  @ApiPropertyOptional({ type: String, example: '2026-05-30T08:45:00.000Z', description: '메일 전송 실패 시각' })
  mailDeliveryFailedAt?: string;

  @ApiProperty({ example: false, description: '현재 사용자 여부' })
  isMe?: boolean;
}

export class InviteResponseDto extends MemberResponseDto {
  @ApiProperty({ enum: InviteStatusDto, example: 'QUEUED', description: '초대 상태' })
  inviteStatus!: InviteStatusDto;

  @ApiProperty({ example: '8b7c9d2e-6d6f-4fbe-9f7f-8a3fd1d2f9d0', description: '메일 전송 시도 식별자' })
  attemptId!: string;

  @ApiProperty({ example: '2026-05-30T08:30:00.000Z', description: '큐 적재 시각' })
  queuedAt!: string;

  @ApiPropertyOptional({ example: '2026-05-30T08:31:00.000Z', description: '메일 전송 성공 시각' })
  sentAt?: string | null;

  @ApiPropertyOptional({ example: '2026-05-30T08:45:00.000Z', description: '메일 전송 실패 시각' })
  failedAt?: string | null;

  @ApiPropertyOptional({ example: '2026-05-30T09:00:00.000Z', description: '초대 취소 시각' })
  cancelAt?: string | null;

  @ApiPropertyOptional({ example: '2026-06-01T10:00:00.000Z', description: '초대 수락 시각' })
  acceptedAt?: string | null;

  @ApiPropertyOptional({ example: '2026-06-01T11:00:00.000Z', description: '초대 거절 시각' })
  rejectedAt?: string | null;
}

export class MemberMutationResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', description: '주요 식별자' })
  id!: string;
}
