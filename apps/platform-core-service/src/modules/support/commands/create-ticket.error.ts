import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

/**
 * 문의 티켓 생성 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({});

/**
 * 문의 티켓 생성 에러 단언자
 */
export const CreateTicketAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
