import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountStatus, Member, MemberAccount, MemberStatus, Organization, OrganizationStatus } from '@pkg/database';

export class AuthTokenResponseDto {
  @ApiProperty({ description: '액세스 토큰' })
  accessToken!: string;
}

export class AuthAccountInfoDto implements Pick<MemberAccount, 'id' | 'email' | 'status' | 'lastLoginAt' | 'passwordExpiresAt' | 'lockUntil'> {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7081', description: '계정 식별자' })
  id!: string;

  @ApiProperty({ example: 'dev@example.com', description: '이메일 주소' })
  email!: string;

  @ApiProperty({ enum: AccountStatus, example: 'ACTIVE', description: '계정 상태' })
  status!: AccountStatus;

  @ApiPropertyOptional({ example: '2026-06-06T14:00:00.000Z', description: '마지막 로그인 일시' })
  lastLoginAt?: Date;

  @ApiProperty({ example: '2026-09-06T14:00:00.000Z', description: '비밀번호 만료 일시' })
  passwordExpiresAt!: Date;

  @ApiPropertyOptional({ example: '2026-06-06T15:00:00.000Z', description: '잠금 해제 일시' })
  lockUntil?: Date;

  @ApiProperty({ example: false, description: '휴면 여부' })
  isDormant!: boolean;

  @ApiProperty({ example: false, description: '비밀번호 만료 여부' })
  isPasswordExpired!: boolean;
}

export class AuthMemberInfoDto implements Pick<Member, 'id' | 'name' | 'status'> {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7082', description: '멤버 식별자' })
  id!: string;

  @ApiProperty({ example: '김개발', description: '멤버 이름' })
  name!: string;

  @ApiProperty({ enum: MemberStatus, example: 'ACTIVE', description: '멤버 상태' })
  status!: MemberStatus;
}

export class AuthOrganizationInfoDto implements Pick<Organization, 'id' | 'code' | 'name' | 'email' | 'status'> {
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

export class AuthMeUserDto {
  @ApiProperty({ type: AuthAccountInfoDto, description: '계정 정보' })
  account!: AuthAccountInfoDto;

  @ApiProperty({ type: AuthMemberInfoDto, description: '멤버 정보' })
  member!: AuthMemberInfoDto;

  @ApiProperty({ type: AuthOrganizationInfoDto, nullable: true, description: '조직 정보' })
  organization!: AuthOrganizationInfoDto | null;

  @ApiProperty({ isArray: true, type: String, description: '권한 목록' })
  permissions!: string[];

  @ApiProperty({ description: '비밀번호 변경 필요 여부' })
  mustChangePassword!: boolean;
}

/**
 * 사용자 상세 정보 응답 DTO
 */
export class AuthMeResponseDto {
  @ApiProperty({ description: '사용자 정보', type: AuthMeUserDto })
  user!: AuthMeUserDto;
}

export type AuthMeUser = AuthMeUserDto;
