import { BadRequestException, NotFoundException } from '@nestjs/common';

import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

/**
 * 역할 권한 매핑 업데이트 커맨드
 */
export class UpdateRolePermissionsCommand {
  constructor(
    readonly roleCode: string,
    readonly permissionCodes: string[],
  ) {}
}

const ERROR_MESSAGES = defineErrors({
  ROLE_NOT_FOUND: {
    message: {
      ko: '역할을 찾을 수 없습니다.',
      en: 'Role not found.',
    },
    exception: NotFoundException,
  },
  INVALID_ROLE_CODE: {
    message: {
      ko: '올바르지 않은 역할 코드입니다.',
      en: 'Invalid role code.',
    },
    exception: BadRequestException,
  },
});

export const UpdateRolePermissionsAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
