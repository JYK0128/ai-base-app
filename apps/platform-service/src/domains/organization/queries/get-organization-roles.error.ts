import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  LOAD_FAILED: {
    message: '조직 역할을 불러오지 못했습니다.',
    exception: ServiceUnavailableException,
  },
  ORGANIZATION_NOT_FOUND: {
    message: '조직 정보를 찾을 수 없습니다.',
    exception: NotFoundException,
  },
});

export const GetOrganizationRolesAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
