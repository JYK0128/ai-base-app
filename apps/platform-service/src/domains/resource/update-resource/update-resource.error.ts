import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  RESOURCE_NOT_FOUND: {
    message: '리소스를 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  RESOURCE_ALREADY_EXISTS: {
    message: '이미 존재하는 리소스 코드입니다.',
    exception: ConflictException,
  },
  PARENT_RESOURCE_SCOPE_MISMATCH: {
    message: '부모 리소스 범위가 일치하지 않습니다.',
    exception: BadRequestException,
  },
  INVALID_RESOURCE_ACTIONS: {
    message: '리소스 액션 구성이 올바르지 않습니다.',
    exception: BadRequestException,
  },
});

export const UpdateResourceAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
