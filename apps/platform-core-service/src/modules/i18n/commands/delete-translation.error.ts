import { BadRequestException, NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  INVALID_LOCALE: {
    message: 'locale 형식이 올바르지 않거나 활성 locale이 아닙니다.',
    exception: BadRequestException,
  },
  TRANSLATION_NOT_FOUND: {
    message: '삭제할 번역을 찾을 수 없습니다.',
    exception: NotFoundException,
  },
});

export const DeleteTranslationAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
