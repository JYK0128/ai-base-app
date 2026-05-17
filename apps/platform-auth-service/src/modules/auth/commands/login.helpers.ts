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
    message: {
      ko: (meta?: LOGIN_METADATA) => {
        const attempts = meta?.attempts;
        const maxAttempts = meta?.maxAttempts;
        const suffix = (attempts !== undefined && maxAttempts !== undefined)
          ? ` (실패 횟수: ${attempts}/${maxAttempts}회)`
          : '';
        return `이메일 또는 비밀번호가 일치하지 않습니다.${suffix}`;
      },
      en: (meta?: LOGIN_METADATA) => {
        const attempts = meta?.attempts;
        const maxAttempts = meta?.maxAttempts;
        const suffix = (attempts !== undefined && maxAttempts !== undefined)
          ? ` (Attempts: ${attempts}/${maxAttempts})`
          : '';
        return `Invalid email or password.${suffix}`;
      },
    },
    exception: UnauthorizedException,
  },
  ACCOUNT_LOCKED: {
    message: {
      ko: (meta?: LOGIN_METADATA) => `로그인 시도가 너무 많아 계정이 잠겼습니다. ${meta?.retryAfterSeconds ?? 1800}초 후에 다시 시도하세요.`,
      en: (meta?: LOGIN_METADATA) => `Too many login attempts. Your account is locked. Please try again after ${meta?.retryAfterSeconds ?? 1800} seconds.`,
    },
    exception: UnauthorizedException,
  },
  INACTIVE_ACCOUNT: {
    message: {
      ko: '비활성화된 계정입니다. 관리자에게 문의하세요.',
      en: 'Account is inactive. Please contact the administrator.',
    },
    exception: ForbiddenException,
  },
  DORMANT_ACCOUNT: {
    message: {
      ko: '장기간 미접속으로 인해 휴면 상태로 전환된 계정입니다. 본인 인증 후 이용해주세요.',
      en: 'Dormant account due to inactivity. Please verify your identity first.',
    },
    exception: ForbiddenException,
  },
  INACTIVE_MANAGER: {
    message: {
      ko: '비활성화된 관리자 권한입니다. 관리자에게 문의하세요.',
      en: 'Inactive manager permissions. Please contact the administrator.',
    },
    exception: ForbiddenException,
  },
  INACTIVE_ORGANIZATION: {
    message: {
      ko: '소속 조직이 활성화 상태가 아닙니다. 관리자에게 문의하세요.',
      en: 'Your organization is inactive. Please contact the administrator.',
    },
    exception: ForbiddenException,
  },
});

/**
 * 로그인 에러 외부 노출 메타데이터 (Public)
 */
export type LOGIN_METADATA = {
  attempts?: number
  maxAttempts?: number
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
