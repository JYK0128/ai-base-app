import { BadRequestException } from '@nestjs/common';

import { defineErrors, ExceptionGuard } from '@/common/utils/exception.util';

export class VerifyManagerRegistrationCommand {
  constructor(public readonly token: string) {}
}

const ERROR_MESSAGES = defineErrors({
  INVALID_TOKEN: {
    message: '유효하지 않은 인증 토큰입니다.',
    exception: BadRequestException,
  },
  TOKEN_EXPIRED: {
    message: '만료된 인증 토큰입니다. 인증 메일을 다시 요청하세요.',
    exception: BadRequestException,
  },
});

export const VerifyManagerRegistrationAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
