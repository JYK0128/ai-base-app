import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  ORGANIZATION_NOT_FOUND: {
    message: {
      ko: '조직을 찾을 수 없습니다.',
      en: 'Organization not found.',
    },
    exception: Error,
  },
  ROLE_NOT_FOUND: {
    message: {
      ko: '권한 세트를 찾을 수 없습니다.',
      en: 'Permission set not found.',
    },
    exception: Error,
  },
  INVALID_PERMISSION_CODE: {
    message: {
      ko: '유효하지 않은 권한 코드가 포함되어 있습니다.',
      en: 'An invalid permission code is included.',
    },
    exception: Error,
  },
  LOAD_FAILED: {
    message: {
      ko: '권한 세트 정보를 수정하는 데 실패했습니다.',
      en: 'Failed to update permission set.',
    },
    exception: Error,
  },
});

export const UpdatePermissionSetPermissionsAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
