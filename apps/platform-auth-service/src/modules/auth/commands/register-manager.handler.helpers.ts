import { BadRequestException, ConflictException } from '@nestjs/common';

import { defineErrors, ExceptionGuard } from '@/common/utils/exception.util';

export class RegisterManagerCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly clientIp: string,
  ) {}
}

const ERROR_MESSAGES = defineErrors({
  EMAIL_ALREADY_EXISTS: {
    message: '이미 가입된 이메일입니다.',
    exception: ConflictException,
  },
  RATE_LIMITED: {
    message: '가입 요청이 너무 많습니다. 잠시 후 다시 시도하세요.',
    exception: BadRequestException,
  },
  ROLE_NOT_FOUND: {
    message: '기본 관리자 역할을 찾을 수 없습니다.',
    exception: BadRequestException,
  },
});

export const RegisterManagerAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
