import { BadRequestException, NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  RESOURCE_NOT_FOUND: {
    message: {
      ko: '리소스를 찾을 수 없습니다.',
      en: 'Resource not found.',
    },
    exception: NotFoundException,
  },
  INVALID_SCOPE: {
    message: {
      ko: '플랫폼 리소스에서만 정렬 순서를 수정할 수 있습니다.',
      en: 'Sort order can only be updated for platform resources.',
    },
    exception: BadRequestException,
  },
});

export const UpdateResourceSortAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
