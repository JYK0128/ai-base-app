import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus, MemberStatus, OrganizationStatus } from '@pkg/database';
import type { AuthAccountContext, AuthMemberContext, AuthOrganizationContext } from '@pkg/shared/server';
export class AccountInfoDto {
  @ApiProperty({ type: String, description: '계정 식별자' })
  id!: string;

  @ApiProperty({ type: String, description: '이메일 주소' })
  email!: string;

  @ApiProperty({ enum: AccountStatus, description: '계정 상태' })
  status!: AccountStatus;

  @ApiProperty({ type: String, nullable: true, description: '마지막 로그인 일시' })
  lastLoginAt!: Date | null;

  @ApiProperty({ type: String, description: '비밀번호 만료 일시' })
  passwordExpiresAt!: Date;

  @ApiProperty({ type: Boolean, description: '휴면 여부' })
  isDormant!: boolean;

  @ApiProperty({ type: Boolean, description: '비밀번호 만료 여부' })
  isPasswordExpired!: boolean;
}
export class MemberInfoDto {
  @ApiProperty({ type: String, description: '멤버 식별자' })
  id!: string;

  @ApiProperty({ type: String, description: '멤버 이름' })
  name!: string;

  @ApiProperty({ enum: MemberStatus, description: '멤버 상태' })
  status!: MemberStatus;
}
export class OrganizationInfoDto {
  @ApiProperty({ type: String, description: '조직 식별자' })
  id!: string;

  @ApiProperty({ type: String, description: '조직 코드' })
  code!: string;

  @ApiProperty({ type: String, description: '조직 이름' })
  name!: string;

  @ApiProperty({ type: String, description: '조직 이메일' })
  email!: string;

  @ApiProperty({ enum: OrganizationStatus, description: '조직 상태' })
  status!: OrganizationStatus;
}
export class MeResponseDto {
  constructor({ account, member, organization, permissions }: {
    account: AuthAccountContext
    member: AuthMemberContext
    organization: AuthOrganizationContext | null
    permissions: string[]
  }) {
    this.account = {
      id: account.id,
      email: account.email,
      status: account.status as AccountStatus,
      lastLoginAt: account.lastLoginAt,
      passwordExpiresAt: account.passwordExpiresAt,
      isDormant: account.isDormant,
      isPasswordExpired: account.isPasswordExpired,
    };
    this.member = {
      id: member.id,
      name: member.name,
      status: member.status as MemberStatus,
    };
    this.organization = organization
      ? {
        id: organization.id,
        code: organization.code,
        name: organization.name,
        email: organization.email,
        status: organization.status as OrganizationStatus,
      }
      : null;
    this.permissions = permissions;
  }

  @ApiProperty({ type: () => AccountInfoDto, description: '계정 정보' })
  account!: AccountInfoDto;

  @ApiProperty({ type: () => MemberInfoDto, description: '멤버 정보' })
  member!: MemberInfoDto;

  @ApiProperty({ type: () => OrganizationInfoDto, nullable: true, description: '조직 정보' })
  organization!: OrganizationInfoDto | null;

  @ApiProperty({ type: String, isArray: true, description: '권한 목록' })
  permissions!: string[];
}
