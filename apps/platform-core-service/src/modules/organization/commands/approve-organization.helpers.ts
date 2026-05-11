import { NotFoundException } from '@nestjs/common';

import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

export class ApproveOrganizationCommand {
  constructor(
    public readonly organizationId: string,
    public readonly approve: boolean,
  ) {}
}

const ERROR_MESSAGES = defineErrors({
  ORGANIZATION_NOT_FOUND: {
    message: '조직을 찾을 수 없습니다.',
    exception: NotFoundException,
  },
});

export const ApproveOrganizationAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
