import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  ORGANIZATION_NOT_FOUND: {
    message: {
      ko: '조직을 찾을 수 없습니다.',
      en: 'Organization not found.',
    },
    exception: Error,
  },
  LOAD_FAILED: {
    message: {
      ko: '권한 세트 목록을 불러오는 데 실패했습니다.',
      en: 'Failed to load permission sets.',
    },
    exception: Error,
  },
});

export const GetPermissionSetsAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
