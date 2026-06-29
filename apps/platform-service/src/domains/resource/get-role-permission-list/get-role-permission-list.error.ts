import { NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  ORGANIZATION_NOT_FOUND: {
    message: '조직을 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  LOAD_FAILED: {
    message: '역할 권한을 불러오지 못했습니다.',
  },
});

export const GetRolePermissionListAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
