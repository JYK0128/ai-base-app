import { NotFoundException, UnauthorizedException } from '@nestjs/common';

import { defineErrors, ExceptionGuard } from '@/common/utils/exception.util';

/**
 * 비밀번호 변경 유예 커맨드
 */
export class DeferPasswordChangeCommand {
  constructor(public readonly id: string) {}
}

/**
 * 비밀번호 변경 유예 에러 메시지 및 예외 타입 정의
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
});

/**
 * 비밀번호 변경 유예 에러 단언자
 */
export const DeferPasswordChangeAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
