import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  LOAD_FAILED: {
    message: '티켓을 불러오지 못했습니다.',
  },
});

export const GetTicketsAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
