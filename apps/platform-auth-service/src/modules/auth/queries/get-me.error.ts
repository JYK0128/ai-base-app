import { UnauthorizedException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

/**
 * 내 정보 조회 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({
  REQUEST_CONTEXT_NOT_FOUND: {
    message: '요청 컨텍스트를 찾을 수 없습니다.',
    exception: UnauthorizedException,
  },
  ACCOUNT_NOT_FOUND: {
    message: '계정을 찾을 수 없습니다.',
    exception: UnauthorizedException,
  },
});

/**
 * 내 정보 조회 어서터
 */
export const GetMeAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
