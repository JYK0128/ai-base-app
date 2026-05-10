import { BadRequestException } from '@nestjs/common';

import { defineErrors, ExceptionGuard } from '@/common/utils/exception.util';

export class ResendManagerVerificationCommand {
  constructor(
    public readonly email: string,
    public readonly clientIp: string,
  ) {}
}

const ERROR_MESSAGES = defineErrors({
  RATE_LIMITED: {
    message: '인증 메일 재발송 요청이 너무 많습니다. 잠시 후 다시 시도하세요.',
    exception: BadRequestException,
  },
});

export const ResendManagerVerificationAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
