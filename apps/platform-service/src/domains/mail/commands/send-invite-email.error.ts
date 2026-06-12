import { BadRequestException, NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

import type { SendInviteEmailFailureContext } from '../mail.types';

const ERROR_MESSAGES = defineErrors({
  INVITE_NOT_FOUND: {
    message: {
      ko: '초대 정보를 찾을 수 없습니다.',
      en: 'Invite not found.',
    },
    exception: NotFoundException,
  },
  INVITE_MAIL_DELIVERY_NOT_READY: {
    message: {
      ko: '초대 메일 전송 요청이 유효하지 않습니다.',
      en: 'The invite mail delivery request is not ready.',
    },
    exception: BadRequestException,
  },
  MAIL_SEND_FAILED: {
    message: {
      ko: '초대 메일 전송에 실패했습니다.',
      en: 'Failed to send invitation email.',
    },
  },
});

export const SendInviteEmailAsserter = ExceptionGuard
  .withContext<SendInviteEmailFailureContext>()
  .setMessages(ERROR_MESSAGES);
