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
  INVITER_NOT_FOUND: {
    message: {
      ko: '초대를 재발송한 사용자를 찾을 수 없습니다.',
      en: 'Resend inviter not found.',
    },
    exception: NotFoundException,
  },
  INVITE_NOT_FOUND: {
    message: {
      ko: '초대 이력을 찾을 수 없습니다.',
      en: 'Invite not found.',
    },
    exception: NotFoundException,
  },
  INVITE_NOT_RESENDABLE: {
    message: {
      ko: '이미 취소되었거나 처리된 초대는 재발송할 수 없습니다.',
      en: 'Canceled or finalized invite cannot be resent.',
    },
    exception: ConflictException,
  },
});

export const ResendInviteAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
