import { BadRequestException, ConflictException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  INVALID_LOCALE: {
    message: 'locale 형식이 올바르지 않거나 활성 locale이 아닙니다.',
    exception: BadRequestException,
  },
  TRANSLATION_ALREADY_EXISTS: {
    message: '이미 존재하는 번역 식별자입니다.',
    exception: ConflictException,
  },
});

export const CreateTranslationAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
