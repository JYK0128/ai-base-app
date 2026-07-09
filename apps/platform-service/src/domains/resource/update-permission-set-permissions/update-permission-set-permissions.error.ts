import { BadRequestException, NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  ORGANIZATION_NOT_FOUND: {
    message: '조직을 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  ROLE_NOT_FOUND: {
    message: '권한 세트를 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  RESOURCE_NOT_FOUND: {
    message: '리소스를 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  INVALID_PERMISSION_CODE: {
    message: '권한 코드 형식이 올바르지 않습니다.',
    exception: BadRequestException,
  },
});

export const UpdatePermissionSetPermissionsAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
