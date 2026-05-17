import { NotFoundException } from '@nestjs/common';

import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

/**
 * 약관 동의 커맨드
 */
export class AgreeTermsCommand {
  constructor(
    readonly managerId: string,
    readonly termsVersionId: string,
    readonly organizationId?: string,
    readonly source?: string,
    readonly ipAddress?: string,
    readonly userAgent?: string,
  ) {}
}

/**
 * 약관 동의 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({
  TERMS_VERSION_NOT_FOUND: {
    message: '약관 버전을 찾을 수 없습니다.',
    exception: NotFoundException,
  },
});

/**
 * 약관 동의 에러 단언자
 */
export const AgreeTermsAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
