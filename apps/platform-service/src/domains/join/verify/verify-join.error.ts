import { ConflictException, NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  INVITE_NOT_FOUND: {
    message: {
      ko: '초대 정보를 찾을 수 없습니다.',
      en: 'Invite not found.',
    },
    exception: NotFoundException,
  },
  INVITE_NOT_AVAILABLE: {
    message: {
      ko: '가입할 수 없는 초대입니다.',
      en: 'Invite is not available for join.',
    },
    exception: ConflictException,
  },
  ACCOUNT_ALREADY_EXISTS: {
    message: {
      ko: '이미 가입된 이메일입니다.',
      en: 'Account already exists.',
    },
    exception: ConflictException,
  },
});

export const VerifyJoinAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
