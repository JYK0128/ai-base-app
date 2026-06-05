import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  ORGANIZATION_NOT_FOUND: {
    message: {
      ko: '조직을 찾을 수 없습니다.',
      en: 'Organization not found.',
    },
    exception: Error,
  },
  ROLE_CODE_ALREADY_EXISTS: {
    message: {
      ko: '이미 존재하는 권한 세트 코드입니다.',
      en: 'Permission set code already exists.',
    },
    exception: Error,
  },
  ROLE_CODE_REQUIRED: {
    message: {
      ko: '권한 세트 코드를 입력해 주세요.',
      en: 'Permission set code is required.',
    },
    exception: Error,
  },
  ROLE_NAME_REQUIRED: {
    message: {
      ko: '권한 세트 이름을 입력해 주세요.',
      en: 'Permission set name is required.',
    },
    exception: Error,
  },
  SOURCE_ROLE_NOT_FOUND: {
    message: {
      ko: '복사할 권한 세트를 찾을 수 없습니다.',
      en: 'Source permission set not found.',
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
      ko: '권한 세트 정보를 생성하는 데 실패했습니다.',
      en: 'Failed to create permission set.',
    },
    exception: Error,
  },
});

export const CreatePermissionSetAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
