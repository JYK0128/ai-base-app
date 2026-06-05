import { BadRequestException, NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
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
  TRANSLATION_NOT_FOUND: {
    message: '삭제할 번역을 찾을 수 없습니다.',
    exception: NotFoundException,
  },
});

export const DeleteTranslationAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
