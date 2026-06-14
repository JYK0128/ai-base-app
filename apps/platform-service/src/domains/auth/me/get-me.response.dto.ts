import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { MemberAccount } from '@pkg/database';
import { AccountStatus, MemberStatus, OrganizationStatus } from '@pkg/database';

export class AuthAccountInfoDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7081', description: '계정 식별자' })
  id!: string;

  @ApiProperty({ example: 'dev@example.com', description: '이메일 주소' })
  email!: string;

  @ApiProperty({ enum: AccountStatus, example: 'ACTIVE', description: '계정 상태' })
  status!: AccountStatus;

  @ApiPropertyOptional({ example: '2026-06-06T14:00:00.000Z', description: '마지막 로그인 일시' })
  lastLoginAt?: string | null;

  @ApiProperty({ example: '2026-09-06T14:00:00.000Z', description: '비밀번호 만료 일시' })
  passwordExpiresAt!: string;

  @ApiPropertyOptional({ example: '2026-06-06T15:00:00.000Z', description: '잠금 해제 일시' })
  lockUntil?: string | null;

  @ApiProperty({ example: false, description: '휴면 여부' })
  isDormant!: boolean;

  @ApiProperty({ example: false, description: '비밀번호 만료 여부' })
  isPasswordExpired!: boolean;
}

export class AuthMemberInfoDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7082', description: '멤버 식별자' })
  id!: string;

  @ApiProperty({ example: '김개발', description: '멤버 이름' })
  name!: string;

  @ApiProperty({ enum: MemberStatus, example: 'ACTIVE', description: '멤버 상태' })
  status!: MemberStatus;
}

export class AuthOrganizationInfoDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7083', description: '조직 식별자' })
  id!: string;

  @ApiProperty({ example: 'ORG001', description: '조직 코드' })
  code!: string;

  @ApiProperty({ example: '개발 조직', description: '조직 이름' })
  name!: string;

  @ApiProperty({ example: 'org@example.com', description: '조직 이메일' })
  email!: string;

  @ApiProperty({ enum: OrganizationStatus, example: 'ACTIVE', description: '조직 상태' })
  status!: OrganizationStatus;
}

export class AuthGetMeResponseDto {
  constructor({
    account,
    permissions,
    agreedTermsVersionIds,
    mustAcceptTerms,
  }: {
    account: MemberAccount
    permissions: string[]
    agreedTermsVersionIds: string[]
    mustAcceptTerms: boolean
  }) {
    const member = account.member;
    const organization = member.organization ?? null;

    this.account = {
      id: account.id,
      email: account.email,
      status: account.status as AccountStatus,
      lastLoginAt: account.lastLoginAt ? account.lastLoginAt.toISOString() : null,
      passwordExpiresAt: account.passwordExpiresAt.toISOString(),
      lockUntil: account.lockUntil ? account.lockUntil.toISOString() : null,
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
    this.agreedTermsVersionIds = agreedTermsVersionIds;
    this.mustAcceptTerms = mustAcceptTerms;
  }

  @ApiProperty({ type: AuthAccountInfoDto, description: '계정 정보' })
  account!: AuthAccountInfoDto;

  @ApiProperty({ type: AuthMemberInfoDto, description: '멤버 정보' })
  member!: AuthMemberInfoDto;

  @ApiProperty({ type: AuthOrganizationInfoDto, nullable: true, description: '조직 정보' })
  organization!: AuthOrganizationInfoDto | null;

  @ApiProperty({ isArray: true, type: String, description: '권한 목록' })
  permissions!: string[];

  @ApiProperty({ isArray: true, type: String, description: '현재 동의한 약관 버전 식별자 목록' })
  agreedTermsVersionIds!: string[];

  @ApiProperty({ description: '약관 재동의 필요 여부' })
  mustAcceptTerms!: boolean;
}
