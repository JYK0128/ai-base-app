import { UnauthorizedException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

import type { LoginRequestDto } from './login.request.dto';

type LoginMetadata = {
  attempts?: number
  maxAttempts?: number
  retryAfterSeconds?: number
};

const AUTH_GUARD_ERROR_MESSAGES = defineErrors({
  INACTIVE_ACCOUNT: {
    message: {
      ko: '비활성화된 계정입니다. 관리자에게 문의하세요.',
      en: 'Account is inactive. Please contact the administrator.',
    },
    exception: UnauthorizedException,
  },
  INACTIVE_MEMBER: {
    message: {
      ko: '비활성화된 멤버 권한입니다. 관리자에게 문의하세요.',
      en: 'Inactive member permissions. Please contact the administrator.',
    },
    exception: UnauthorizedException,
  },
  INACTIVE_ORGANIZATION: {
    message: {
      ko: '소속 조직이 활성화 상태가 아닙니다. 관리자에게 문의하세요.',
      en: 'Your organization is inactive. Please contact the administrator.',
    },
    exception: UnauthorizedException,
  },
  DORMANT_ACCOUNT: {
    message: {
      ko: '장기간 미접속으로 인해 휴면 상태로 전환된 계정입니다. 본인 인증 후 이용해주세요.',
      en: 'Dormant account due to inactivity. Please verify your identity first.',
    },
    exception: UnauthorizedException,
  },
  PASSWORD_CHANGE_REQUIRED: {
    message: {
      ko: '비밀번호를 변경해야 이용할 수 있습니다.',
      en: 'You must change your password before continuing.',
    },
    exception: UnauthorizedException,
  },
  TERMS_AGREEMENT_REQUIRED: {
    message: {
      ko: '약관에 동의해야 이용할 수 있습니다.',
      en: 'You must agree to the terms before continuing.',
    },
    exception: UnauthorizedException,
  },
  INSUFFICIENT_PERMISSIONS: {
    message: {
      ko: '이 리소스에 접근할 권한이 없습니다.',
      en: 'Insufficient permissions to access this resource.',
    },
    exception: UnauthorizedException,
  },
});

const ERROR_MESSAGES = defineErrors({
  REQUEST_CONTEXT_NOT_FOUND: {
    message: {
      ko: '요청 컨텍스트를 찾을 수 없습니다.',
      en: 'Request context not found.',
    },
    exception: UnauthorizedException,
  },
  INVALID_CREDENTIALS: {
    message: {
      ko: (meta: LoginMetadata) => {
        const attempts = meta.attempts;
        const maxAttempts = meta.maxAttempts;
        const suffix = (attempts !== undefined && maxAttempts !== undefined)
          ? ` (실패 횟수: ${attempts}/${maxAttempts}회)`
          : '';
        return `이메일 또는 비밀번호가 일치하지 않습니다.${suffix}`;
      },
      en: (meta: LoginMetadata) => {
        const attempts = meta.attempts;
        const maxAttempts = meta.maxAttempts;
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
      ko: (meta: LoginMetadata) => `로그인 시도가 너무 많아 계정이 잠겼습니다. ${Math.ceil((meta.retryAfterSeconds ?? 1800) / 60)}분 후에 다시 시도하세요.`,
      en: (meta: LoginMetadata) => `Too many login attempts. Your account is locked. Please try again after ${Math.ceil((meta.retryAfterSeconds ?? 1800) / 60)} minutes.`,
    },
    exception: UnauthorizedException,
  },
  ...AUTH_GUARD_ERROR_MESSAGES,
});

export const LoginAsserter = ExceptionGuard
  .withMetadata<LoginMetadata>()
  .withContext<LoginRequestDto>()
  .setMessages(ERROR_MESSAGES);
