import { UnauthorizedException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

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

export const RefreshTokenAsserter = ExceptionGuard.setMessages(REFRESH_TOKEN_ERROR_MESSAGES);
