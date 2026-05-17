import { UnauthorizedException } from '@nestjs/common';

import { defineErrors, ExceptionGuard } from '@/common/utils/exception.util';

/**
 * 리프레시 토큰 커맨드
 */
export class RefreshTokenCommand {
  constructor(public readonly refreshToken: string) {}
}

/**
 * 리프레시 토큰 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({
  INVALID_TOKEN_TYPE: {
    message: '유효하지 않은 리프레시 토큰입니다.',
    exception: UnauthorizedException,
  },
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
  INACTIVE_MANAGER: {
    message: '조직 권한이 비활성화되었습니다. 관리자에게 문의하세요.',
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

/**
 * 리프레시 토큰 에러 단언자
 */
export const RefreshTokenAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
