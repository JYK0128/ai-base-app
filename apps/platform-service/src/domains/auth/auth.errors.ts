import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

import type { LoginContext, LoginMetadata } from './auth.types';

const LOGIN_ERROR_MESSAGES = defineErrors({
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
  INACTIVE_MEMBER: {
    message: {
      ko: '비활성화된 멤버 권한입니다. 관리자에게 문의하세요.',
      en: 'Inactive member permissions. Please contact the administrator.',
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

const REFRESH_TOKEN_ERROR_MESSAGES = defineErrors({
  SESSION_EXPIRED: {
    message: '유효하지 않거나 만료된 세션입니다.',
    exception: UnauthorizedException,
  },
  ACCOUNT_NOT_FOUND: {
    message: '계정을 찾을 수 없습니다.',
    exception: UnauthorizedException,
  },
  INACTIVE_ACCOUNT: {
    message: '비활성화된 계정입니다. 관리자에게 문의하세요.',
    exception: UnauthorizedException,
  },
  INACTIVE_MEMBER: {
    message: '멤버 권한이 비활성화되었습니다. 관리자에게 문의하세요.',
    exception: UnauthorizedException,
  },
  INACTIVE_ORGANIZATION: {
    message: '소속 조직이 활성화 상태가 아닙니다. 관리자에게 문의하세요.',
    exception: UnauthorizedException,
  },
  NOT_BELONG_TO_ORGANIZATION: {
    message: '소속된 조직 정보가 없습니다.',
    exception: UnauthorizedException,
  },
  INVALID_TOKEN: {
    message: '유효하지 않거나 만료된 리프레시 토큰입니다.',
    exception: UnauthorizedException,
  },
});

const PASSWORD_ERROR_MESSAGES = defineErrors({
  ACCOUNT_NOT_FOUND: {
    message: '계정을 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  INACTIVE_ACCOUNT: {
    message: '비활성화된 계정입니다. 관리자에게 문의하세요.',
    exception: UnauthorizedException,
  },
  ACCOUNT_LOCKED: {
    message: '로그인 시도가 너무 많아 계정이 잠겼습니다. 잠시 후 다시 시도하세요.',
    exception: UnauthorizedException,
  },
  INVALID_CURRENT_PASSWORD: {
    message: '현재 비밀번호가 일치하지 않습니다.',
    exception: BadRequestException,
  },
});

const GET_ME_ERROR_MESSAGES = defineErrors({
  REQUEST_CONTEXT_NOT_FOUND: {
    message: '요청 컨텍스트를 찾을 수 없습니다.',
    exception: UnauthorizedException,
  },
  ACCOUNT_NOT_FOUND: {
    message: '계정을 찾을 수 없습니다.',
    exception: UnauthorizedException,
  },
});

const LoginAsserter = ExceptionGuard
  .withMetadata<LoginMetadata>()
  .withContext<LoginContext>()
  .setMessages(LOGIN_ERROR_MESSAGES);

const RefreshTokenAsserter = ExceptionGuard
  .setMessages(REFRESH_TOKEN_ERROR_MESSAGES);

const ChangePasswordAsserter = ExceptionGuard
  .setMessages(PASSWORD_ERROR_MESSAGES);

const DeferPasswordChangeAsserter = ExceptionGuard
  .setMessages(PASSWORD_ERROR_MESSAGES);

const GetMeAsserter = ExceptionGuard
  .setMessages(GET_ME_ERROR_MESSAGES);

export { ChangePasswordAsserter,
  DeferPasswordChangeAsserter,
  GetMeAsserter,
  LoginAsserter,
  RefreshTokenAsserter };
