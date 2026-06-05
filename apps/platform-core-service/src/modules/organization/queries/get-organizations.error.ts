import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

/**
 * 조직 목록 조회 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({});

/**
 * 조직 목록 조회 에러 단언자
 */
export const GetOrganizationsAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
