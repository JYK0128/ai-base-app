import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenResponseDto {
  @ApiProperty({ description: '액세스 토큰' })
  accessToken!: string;
}

export class AuthAccountInfoDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7097', description: '계정 식별자' })
  id!: string;

  @ApiProperty({ example: 'admin@example.com', description: '이메일 주소' })
  email!: string;

  @ApiProperty({ example: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'], description: '계정 상태' })
  status!: string;

  @ApiProperty({ example: '2026-05-23T10:11:12.000Z', nullable: true, description: '최근 로그인 일시' })
  lastLoginAt!: string | null;

  @ApiProperty({ example: '2026-06-03T07:25:00.000Z', description: '비밀번호 만료 일시' })
  passwordExpiresAt!: string;

  @ApiProperty({ example: '2026-06-03T07:25:00.000Z', nullable: true, description: '계정 잠금 해제 시각' })
  lockUntil!: string | null;

  @ApiProperty({ example: false, description: '휴면 여부' })
  isDormant!: boolean;

  @ApiProperty({ example: false, description: '비밀번호 만료 여부' })
  isPasswordExpired!: boolean;
}

export class AuthMemberInfoDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', description: '멤버 식별자' })
  id!: string;

  @ApiProperty({ example: 'Hana Lee', description: '이름' })
  name!: string;

  @ApiProperty({ example: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'], description: '멤버 상태' })
  status!: string;
}

export class AuthOrganizationInfoDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7088', description: '조직 식별자' })
  id!: string;

  @ApiProperty({ example: 'platform', description: '조직 코드' })
  code!: string;

  @ApiProperty({ example: '좋은회사', description: '조직명' })
  name!: string;

  @ApiProperty({ example: 'platform@example.com', description: '조직 이메일' })
  email!: string;

  @ApiProperty({ example: 'ACTIVE', enum: ['PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED'], description: '조직 상태' })
  status!: string;
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
