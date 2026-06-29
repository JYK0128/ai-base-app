import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  REQUEST_CONTEXT_NOT_FOUND: {
    message: '요청 인증 정보를 확인할 수 없습니다.',
    exception: UnauthorizedException,
  },
  MEMBER_MISMATCH: {
    message: '현재 로그인한 계정의 멤버 정보와 요청 값이 일치하지 않습니다.',
    exception: ForbiddenException,
  },
  TERMS_VERSION_NOT_AVAILABLE: {
    message: '동의할 수 없는 약관 버전입니다.',
    exception: BadRequestException,
  },
  TERMS_VERSION_NOT_FOUND: {
    message: '동의할 약관 버전을 찾을 수 없습니다.',
    exception: NotFoundException,
  },
});

export const AgreeTermsAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
