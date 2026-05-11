import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { defineErrors, ExceptionGuard } from '@/common/utils/exception.util';

/**
 * 비밀번호 변경 커맨드
 */
export class ChangePasswordCommand {
  constructor(
    public readonly id: string,
    public readonly currentPassword: string,
    public readonly newPassword: string,
  ) {}
}

/**
 * 비밀번호 변경 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({
  ACCOUNT_NOT_FOUND: {
    message: '계정을 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  INACTIVE_ACCOUNT: {
    message: '비활성화된 계정입니다. 관리자에게 문의하세요.',
    exception: UnauthorizedException,
  },
  ACCOUNT_LOCKED: {
    message: '로그인 시도가 너무 많아 계정이 잠겼습니다. 잠시 후 다시 시도하세요.',
    exception: UnauthorizedException,
  },
  INVALID_CURRENT_PASSWORD: {
    message: '현재 비밀번호가 일치하지 않습니다.',
    exception: BadRequestException,
  },
});

/**
 * 비밀번호 변경 에러 단언자
 */
export const ChangePasswordAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
