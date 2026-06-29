import { UnauthorizedException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

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

export const MeAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
