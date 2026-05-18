import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

/**
 * 역할 목록 조회 커맨드
 */
export class GetRolesCommand {
  constructor() {}
}

const ERROR_MESSAGES = defineErrors({
  LOAD_FAILED: {
    message: {
      ko: '역할 목록을 불러오는 데 실패했습니다.',
      en: 'Failed to load roles.',
    },
    exception: Error,
  },
});

export const GetRolesAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
