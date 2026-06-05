import { NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

/**
 * 문의 티켓 생성 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({
  AUTHOR_NOT_FOUND: {
    message: {
      ko: '문의 작성자를 찾을 수 없습니다.',
      en: 'Ticket author not found.',
    },
    exception: NotFoundException,
  },
});

/**
 * 문의 티켓 생성 에러 단언자
 */
export const CreateTicketAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
