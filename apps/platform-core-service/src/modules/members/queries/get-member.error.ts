import { InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
  LOAD_FAILED: {
    message: {
      ko: '멤버 정보를 불러오는 데 실패했습니다.',
      en: 'Failed to load member.',
    },
    exception: InternalServerErrorException,
  },
});

export const GetMemberAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
