import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MemberInvite, MemberInviteInfoMetadata, MemberInviteStatus as InviteStatusDto, MemberStatus as MemberStatusDto } from '@pkg/database';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { IsNotEmptyString } from '@/common/decorators/is-not-empty-string.decorator';

export { InviteStatusDto, MemberStatusDto };

export enum MemberRoleDto {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  VIEWER = 'VIEWER',
}

export const MAIL_DELIVERY_STATUS_VALUES = ['QUEUED', 'SENT', 'FAILED'] as const;
export type MailDeliveryStatusDto = (typeof MAIL_DELIVERY_STATUS_VALUES)[number];

export class IdParamDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', description: '식별자' })
  @IsUUID()
  id!: string;
}

export class GetMembersQueryDto {
  @ApiPropertyOptional({ example: 'kim', description: '검색어' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: MemberStatusDto, example: 'ACTIVE', description: '멤버 상태' })
  @IsOptional()
  @IsEnum(MemberStatusDto)
  status?: MemberStatusDto;

  @ApiPropertyOptional({ enum: MemberRoleDto, example: 'MANAGER', description: '조직 역할' })
  @IsOptional()
  @IsEnum(MemberRoleDto)
  role?: MemberRoleDto;
}

export class GetInvitesQueryDto {
  @ApiPropertyOptional({ example: 'kim', description: '검색어' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: InviteStatusDto, example: 'PENDING', description: '초대 상태' })
  @IsOptional()
  @IsEnum(InviteStatusDto)
  inviteStatus?: InviteStatusDto;

  @ApiPropertyOptional({ enum: MemberRoleDto, example: 'MANAGER', description: '조직 역할' })
  @IsOptional()
  @IsEnum(MemberRoleDto)
  role?: MemberRoleDto;
}

export class CreateInviteDto implements Pick<MemberInvite, 'name' | 'email'>, Pick<MemberInviteInfoMetadata, 'note'> {
  @ApiProperty({ example: '김개발', description: '초대할 사람 이름' })
  @IsNotEmptyString({ message: '이름은 공백만으로 구성될 수 없습니다.' })
  name!: string;

  @ApiProperty({ example: 'dev@example.com', description: '초대할 사람 이메일' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: MemberRoleDto, example: 'MANAGER', description: '부여할 역할' })
  @IsEnum(MemberRoleDto)
  role!: MemberRoleDto;

  @ApiPropertyOptional({ example: '프로젝트 초대', description: '메모/메모사항' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class ResendInviteDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', description: '초대 식별자' })
  @IsUUID()
  id!: string;
}

export class CancelInviteDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', description: '초대 식별자' })
  @IsUUID()
  id!: string;
}

export class ReviveInviteDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', description: '초대 식별자' })
  @IsUUID()
  id!: string;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', description: '멤버 식별자' })
  @IsUUID()
  id!: string;

  @ApiProperty({ enum: MemberRoleDto, example: 'OWNER', description: '변경할 역할' })
  @IsEnum(MemberRoleDto)
  role!: MemberRoleDto;
}

export class ToggleMemberStatusDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', description: '멤버 식별자' })
  @IsUUID()
  id!: string;
}
