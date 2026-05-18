import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

/**
 * 역할별 권한 매핑 매트릭스 조회 커맨드 (전체 조회용)
 */
export class GetRolePermissionsMatrixCommand {
  constructor() {}
}

const ERROR_MESSAGES = defineErrors({
  LOAD_FAILED: {
    message: {
      ko: '역할별 권한 매트릭스를 불러오는 데 실패했습니다.',
      en: 'Failed to load role permissions matrix.',
    },
    exception: Error,
  },
});

export const GetRolePermissionsMatrixAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
