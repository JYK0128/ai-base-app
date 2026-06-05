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
      ko: '플랫폼 리소스에서만 권한을 수정할 수 있습니다.',
      en: 'Permissions can only be updated for platform resources.',
    },
    exception: BadRequestException,
  },
  CANNOT_REMOVE_ACTIVE_CONSTRAINT: {
    message: {
      ko: '하위 컴포넌트에서 이미 사용 중인 액션 제약은 해제할 수 없습니다.',
      en: 'Cannot remove actions that are actively used as constraints by child components.',
    },
    exception: BadRequestException,
  },
});

export const UpdateResourcePermissionsAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
