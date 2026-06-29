import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  ACCOUNT_NOT_FOUND: {
    message: '계정을 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  INACTIVE_ACCOUNT: {
    message: '비활성화된 계정입니다. 관리자에게 문의하세요.',
    exception: UnauthorizedException,
  },
});

export const DeferPasswordChangeAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
