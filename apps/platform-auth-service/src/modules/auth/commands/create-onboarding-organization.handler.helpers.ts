import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { defineErrors, ExceptionGuard } from '@/common/utils/exception.util';

export class CreateOnboardingOrganizationCommand {
  constructor(
    public readonly id: string,
    public readonly organizationName: string,
    public readonly organizationCode: string,
    public readonly organizationEmail: string,
  ) {}
}

const ERROR_MESSAGES = defineErrors({
  ACCOUNT_NOT_FOUND: {
    message: '계정을 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  ACCOUNT_NOT_VERIFIED: {
    message: '이메일 인증이 완료되지 않은 계정입니다.',
    exception: ForbiddenException,
  },
  ORGANIZATION_ALREADY_EXISTS: {
    message: '이미 조직 생성이 완료된 계정입니다.',
    exception: ConflictException,
  },
  ORGANIZATION_CODE_EXISTS: {
    message: '이미 사용 중인 조직 코드입니다.',
    exception: ConflictException,
  },
  ORGANIZATION_EMAIL_EXISTS: {
    message: '이미 사용 중인 조직 이메일입니다.',
    exception: ConflictException,
  },
  ROLE_NOT_FOUND: {
    message: '기본 관리자 역할을 찾을 수 없습니다.',
    exception: NotFoundException,
  },
});

export const CreateOnboardingOrganizationAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
