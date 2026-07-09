import { BadRequestException, NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  RESOURCE_NOT_FOUND: {
    message: '리소스를 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  RESOURCE_HAS_CHILDREN: {
    message: '하위 리소스가 존재합니다.',
    exception: BadRequestException,
  },
});

export const DeleteResourceAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
