import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
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
  EMAIL_MISMATCH: {
    message: {
      ko: '초대 이메일과 가입 이메일이 일치하지 않습니다.',
      en: 'Join email does not match invite email.',
    },
    exception: BadRequestException,
  },
  ACCOUNT_ALREADY_EXISTS: {
    message: {
      ko: '이미 가입된 이메일입니다.',
      en: 'Account already exists.',
    },
    exception: ConflictException,
  },
  REQUIRED_TERMS_NOT_AGREED: {
    message: {
      ko: '필수 약관에 모두 동의해야 합니다.',
      en: 'All required terms must be agreed.',
    },
    exception: BadRequestException,
  },
  INVALID_TERMS: {
    message: {
      ko: '가입 대상 약관이 아닙니다.',
      en: 'Terms are not valid for join.',
    },
    exception: BadRequestException,
  },
});

export const AcceptJoinAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
