import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

/**
 * 자원 트리 조회 커맨드
 */
export class GetResourcesCommand {
  constructor() {}
}

const ERROR_MESSAGES = defineErrors({
  LOAD_FAILED: {
    message: {
      ko: '자원 목록을 불러오는 데 실패했습니다.',
      en: 'Failed to load resources.',
    },
    exception: Error,
  },
});

export const GetResourcesAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
