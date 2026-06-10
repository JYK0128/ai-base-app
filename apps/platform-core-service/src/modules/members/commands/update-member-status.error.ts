import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  ORGANIZATION_NOT_FOUND: {
    message: {
      ko: '조직을 찾을 수 없습니다.',
      en: 'Organization not found.',
    },
    exception: NotFoundException,
  },
  REQUEST_CONTEXT_NOT_FOUND: {
    message: {
      ko: '요청 사용자 정보를 찾을 수 없습니다.',
      en: 'Request user context not found.',
    },
    exception: UnauthorizedException,
  },
  MEMBER_NOT_FOUND: {
    message: {
      ko: '멤버를 찾을 수 없습니다.',
      en: 'Member not found.',
    },
    exception: NotFoundException,
  },
  CANNOT_MODIFY_SELF: {
    message: {
      ko: '내 계정은 수정할 수 없습니다.',
      en: 'You cannot modify your own account.',
    },
    exception: ForbiddenException,
  },
  LAST_OWNER_STATUS_CANNOT_BE_CHANGED: {
    message: {
      ko: '조직의 마지막 소유자는 비활성화할 수 없습니다.',
      en: 'The last owner of the organization cannot be deactivated.',
    },
    exception: ForbiddenException,
  },
});

export const ToggleMemberStatusAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
