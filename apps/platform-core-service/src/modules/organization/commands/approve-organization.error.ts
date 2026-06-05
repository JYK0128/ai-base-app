import { NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

/**
 * 조직 승인 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({
  ORGANIZATION_NOT_FOUND: {
    message: '조직을 찾을 수 없습니다.',
    exception: NotFoundException,
  },
});

/**
 * 조직 승인 에러 단언자
 */
export const ApproveOrganizationAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
