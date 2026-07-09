import { BadRequestException, ConflictException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  ORGANIZATION_NOT_FOUND: {
    message: '조직을 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  ORGANIZATION_ROLE_ALREADY_EXISTS: {
    message: '이미 존재하는 조직 역할 코드입니다.',
    exception: ConflictException,
  },
  ORGANIZATION_ROLE_NOT_FOUND: {
    message: '조직 역할을 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  ORGANIZATION_ROLE_PROTECTED: {
    message: '시스템 기본 역할은 변경할 수 없습니다.',
    exception: BadRequestException,
  },
  ORGANIZATION_ROLE_HAS_ASSIGNMENTS: {
    message: '역할이 멤버에 할당되어 있어 삭제할 수 없습니다.',
    exception: BadRequestException,
  },
  INVALID_ORGANIZATION_ROLE_SORT: {
    message: '조직 역할 정렬 값이 올바르지 않습니다.',
    exception: BadRequestException,
  },
  ORGANIZATION_ROLE_LOAD_FAILED: {
    message: '조직 역할을 처리하지 못했습니다.',
    exception: ServiceUnavailableException,
  },
});

export const OrganizationRoleAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
