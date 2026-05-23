import { BadRequestException, ConflictException } from '@nestjs/common';

import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

const ERROR_MESSAGES = defineErrors({
  INVALID_NAMESPACE: {
    message: 'namespace 정보가 올바르지 않습니다.',
    exception: BadRequestException,
  },
  INVALID_KEY: {
    message: 'key 정보가 올바르지 않습니다.',
    exception: BadRequestException,
  },
  INVALID_TRANSLATION_IDENTIFIER: {
    message: '번역 식별자 정보가 올바르지 않습니다.',
    exception: BadRequestException,
  },
  INVALID_LOCALE: {
    message: 'locale 형식이 올바르지 않거나 활성 locale이 아닙니다.',
    exception: BadRequestException,
  },
  VALUE_REQUIRED: {
    message: '번역 값이 필요합니다.',
    exception: BadRequestException,
  },
  ACTIVE_LOCALES_NOT_FOUND: {
    message: '활성 locale 목록을 조회할 수 없습니다.',
    exception: BadRequestException,
  },
  TRANSLATION_ALREADY_EXISTS: {
    message: '이미 존재하는 번역 식별자입니다.',
    exception: ConflictException,
  },
});

export const CreateTranslationAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
