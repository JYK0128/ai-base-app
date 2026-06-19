import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  LOAD_FAILED: {
    message: '리소스를 불러오지 못했습니다.',
  },
});

export const GetResourcePageAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
