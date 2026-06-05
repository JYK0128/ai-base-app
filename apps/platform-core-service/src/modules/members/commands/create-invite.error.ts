import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
      ko: '초대를 생성한 사용자를 찾을 수 없습니다.',
      en: 'Inviter not found.',
    },
    exception: NotFoundException,
  },
  ROLE_NOT_FOUND: {
    message: {
      ko: '조직 역할을 찾을 수 없습니다.',
      en: 'Organization role not found.',
    },
    exception: NotFoundException,
  },
  INVITE_NAME_REQUIRED: {
    message: {
      ko: '초대 이름은 필수입니다.',
      en: 'Invite name is required.',
    },
    exception: BadRequestException,
  },
  INVITE_EMAIL_REQUIRED: {
    message: {
      ko: '초대 이메일은 필수입니다.',
      en: 'Invite email is required.',
    },
    exception: BadRequestException,
  },
});

export const CreateInviteAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
