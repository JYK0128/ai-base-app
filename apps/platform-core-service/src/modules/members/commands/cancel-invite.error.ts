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
  INVITE_NOT_CANCELLABLE: {
    message: {
      ko: '현재 상태의 초대는 취소할 수 없습니다.',
      en: 'This invite cannot be canceled in its current state.',
    },
    exception: BadRequestException,
  },
});

export const CancelInviteAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
