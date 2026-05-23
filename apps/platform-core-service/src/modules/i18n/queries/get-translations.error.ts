import { BadRequestException } from '@nestjs/common';

import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

const ERROR_MESSAGES = defineErrors({
  INVALID_QUALIFIED_KEY: {
    message: '배치 조회 키 형식이 올바르지 않습니다.',
    exception: BadRequestException,
  },
  INVALID_NAMESPACE: {
    message: 'namespace 형식이 올바르지 않습니다.',
    exception: BadRequestException,
  },
  INVALID_KEY: {
    message: 'key 형식이 올바르지 않습니다.',
    exception: BadRequestException,
  },
  INVALID_LOCALE: {
    message: 'locale 형식이 올바르지 않거나 활성 locale이 아닙니다.',
    exception: BadRequestException,
  },
  ACTIVE_LOCALES_NOT_FOUND: {
    message: '활성 locale 목록을 조회할 수 없습니다.',
    exception: BadRequestException,
  },
});

export const GetTranslationsAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
