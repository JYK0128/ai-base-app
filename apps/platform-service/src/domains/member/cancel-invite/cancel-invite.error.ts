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
  INVITE_NOT_FOUND: {
    message: {
      ko: '초대 이력을 찾을 수 없습니다.',
      en: 'Invite not found.',
    },
    exception: NotFoundException,
  },
  INVITE_ALREADY_FINALIZED: {
    message: {
      ko: '이미 처리된 초대는 취소할 수 없습니다.',
      en: 'Already finalized invite cannot be canceled.',
    },
    exception: ConflictException,
  },
});

export const CancelInviteAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
