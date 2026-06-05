import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  LOAD_FAILED: {
    message: {
      ko: '리소스 목록을 불러오는 데 실패했습니다.',
      en: 'Failed to load resources.',
    },
    exception: Error,
  },
});

export const GetResourcesAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
