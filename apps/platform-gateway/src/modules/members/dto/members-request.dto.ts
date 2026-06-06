import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum MemberRoleDto {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  VIEWER = 'VIEWER',
}

export enum MemberStatusDto {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum InviteStatusDto {
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
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

export class CreateInviteDto {
  @ApiProperty({ example: 'Hana Lee', description: '이름' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'hana.lee@example.com', description: '이메일' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: MemberRoleDto, example: 'MANAGER', description: '부여할 역할' })
  @IsEnum(MemberRoleDto)
  role!: MemberRoleDto;

  @ApiPropertyOptional({ example: '디자인팀 합류 예정', description: '메모' })
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
