import { NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  ORGANIZATION_NOT_FOUND: {
    message: '조직을 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  LOAD_FAILED: {
    message: '권한 세트를 불러오지 못했습니다.',
  },
});

export const GetPermissionSetsAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
