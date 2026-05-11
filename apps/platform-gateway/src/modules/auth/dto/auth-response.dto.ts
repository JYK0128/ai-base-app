import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenResponseDto {
  @ApiProperty({ description: '액세스 토큰' })
  accessToken!: string;
}

export class AuthPermissionsResponseDto {
  @ApiProperty({ description: '할당된 역할 코드 목록', type: [String] })
  roles!: string[];

  @ApiProperty({ description: '할당된 권한 코드 목록', type: [String] })
  permissions!: string[];

  @ApiProperty({ description: '권한별 메타데이터 (UI 설정 등)', type: 'object', additionalProperties: { type: 'object' } })
  metadata!: Record<string, unknown>;
}

/**
 * 사용자 상세 정보 DTO
 */
export class AuthUserInfoDto {
  @ApiProperty({ description: '관리자 고유 ID' })
  id!: string;

  @ApiProperty({ description: '이메일 주소' })
  email!: string;

  @ApiProperty({ description: '관리자 상태 (ACTIVE, INACTIVE)' })
  status!: string;

  @ApiProperty({ description: '소속 조직 ID', required: false })
  organizationId?: string;
}

/**
 * 내 정보 조회 응답 DTO
 */
export class AuthMeResponseDto {
  @ApiProperty({ description: '사용자 정보', type: AuthUserInfoDto })
  user!: AuthUserInfoDto;
}
