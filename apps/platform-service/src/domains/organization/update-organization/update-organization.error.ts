import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
  ORGANIZATION_EMAIL_ALREADY_EXISTS: {
    message: {
      ko: '이미 사용 중인 조직 이메일입니다.',
      en: 'Organization email already exists.',
    },
    exception: ConflictException,
  },
});

export const UpdateOrganizationAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
