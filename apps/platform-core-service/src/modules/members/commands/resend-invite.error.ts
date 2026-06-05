import { BadRequestException, NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  ORGANIZATION_NOT_FOUND: {
    message: {
      ko: '조직을 찾을 수 없습니다.',
      en: 'Organization not found.',
    },
    exception: NotFoundException,
  },
  INVITE_NOT_FOUND: {
    message: {
      ko: '초대 정보를 찾을 수 없습니다.',
      en: 'Invite not found.',
    },
    exception: NotFoundException,
  },
  INVITE_NOT_RESENDABLE: {
    message: {
      ko: '현재 상태의 초대는 재전송할 수 없습니다.',
      en: 'This invite cannot be resent in its current state.',
    },
    exception: BadRequestException,
  },
  ROLE_NOT_FOUND: {
    message: {
      ko: '조직 역할을 찾을 수 없습니다.',
      en: 'Organization role not found.',
    },
    exception: NotFoundException,
  },
});

export const ResendInviteAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
