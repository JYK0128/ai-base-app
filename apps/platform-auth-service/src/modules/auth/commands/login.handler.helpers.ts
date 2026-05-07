import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

import { defineErrors, ExceptionGuard } from '@/common/utils/exception.util';

/**
 * 로그인 커맨드
 */
export class LoginCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly clientIp: string,
  ) {}
}

/**
 * 로그인 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({
  INVALID_CREDENTIALS: {
    message: '이메일 또는 비밀번호가 일치하지 않습니다.',
    exception: UnauthorizedException,
  },
  ACCOUNT_LOCKED: {
    message: '로그인 시도가 너무 많아 계정이 잠겼습니다. 잠시 후 다시 시도하세요.',
    exception: UnauthorizedException,
  },
  PASSWORD_CHANGE_REQUIRED: {
    message: '비밀번호 변경이 필요합니다.',
    exception: ForbiddenException,
  },
  INACTIVE_ACCOUNT: {
    message: '비활성화된 계정입니다. 관리자에게 문의하세요.',
    exception: ForbiddenException,
  },
  DORMANT_ACCOUNT: {
    message: '장기간 미접속으로 인해 휴면 상태로 전환된 계정입니다. 본인 인증 후 이용해주세요.',
    exception: ForbiddenException,
  },
  INACTIVE_MANAGER: {
    message: '비활성화된 관리자 권한입니다. 관리자에게 문의하세요.',
    exception: ForbiddenException,
  },
  INACTIVE_ORGANIZATION: {
    message: '소속 조직이 활성화 상태가 아닙니다. 관리자에게 문의하세요.',
    exception: ForbiddenException,
  },
});

/**
 * 로그인 에러 외부 노출 메타데이터 (Public)
 */
export type LOGIN_METADATA = {
  remainingAttempts?: number
  retryAfterSeconds?: number
  lockedUntil?: string
  accessToken?: string
};

/**
 * 로그인 에러 내부 처리 컨텍스트 (Private)
 */
export type LOGIN_CONTEXT = {
  email: string
};

/**
 * 로그인 에러 단언자 (기본 설정)
 */
export const LoginAsserter = ExceptionGuard
  .withMetadata<LOGIN_METADATA>()
  .withContext<LOGIN_CONTEXT>()
  .setMessages(ERROR_MESSAGES);
