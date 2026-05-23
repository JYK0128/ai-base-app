import { BadRequestException, NotFoundException } from '@nestjs/common';

import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

const ERROR_MESSAGES = defineErrors({
  RESOURCE_NOT_FOUND: {
    message: {
      ko: '리소스를 찾을 수 없습니다.',
      en: 'Resource not found.',
    },
    exception: NotFoundException,
  },
  ALREADY_EXISTS: {
    message: {
      ko: '이미 동일한 코드의 리소스가 존재합니다.',
      en: 'A resource with the same code already exists.',
    },
    exception: BadRequestException,
  },
});

export const UpdateResourceDetailAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
