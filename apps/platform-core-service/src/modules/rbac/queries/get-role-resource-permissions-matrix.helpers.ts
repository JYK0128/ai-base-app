import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

/**
 * 역할-자원-권한 매트릭스 조회 커맨드 (전체 조회용)
 */
export class GetRoleResourcePermissionsMatrixCommand {
  constructor() {}
}

const ERROR_MESSAGES = defineErrors({
  LOAD_FAILED: {
    message: {
      ko: '역할-자원-권한 매트릭스를 불러오는 데 실패했습니다.',
      en: 'Failed to load role-resource-permissions matrix.',
    },
    exception: Error,
  },
});

export const GetRoleResourcePermissionsMatrixAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
