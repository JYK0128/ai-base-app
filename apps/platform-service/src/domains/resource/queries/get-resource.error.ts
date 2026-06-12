import { NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  RESOURCE_NOT_FOUND: {
    message: '리소스를 찾을 수 없습니다.',
    exception: NotFoundException,
  },
});

export const GetResourceAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
