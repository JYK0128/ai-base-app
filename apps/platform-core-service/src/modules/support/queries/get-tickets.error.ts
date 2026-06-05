import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

/**
 * 문의 티켓 목록 조회 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({});

/**
 * 문의 티켓 목록 조회 에러 단언자
 */
export const GetTicketsAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
