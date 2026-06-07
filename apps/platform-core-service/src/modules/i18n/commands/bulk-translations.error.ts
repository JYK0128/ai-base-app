import { BadRequestException, NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  EMPTY_OPERATIONS: {
    message: {
      ko: '처리할 번역이 없습니다.',
      en: 'No translations were provided to process.',
    },
    exception: BadRequestException,
  },
  INVALID_LOCALE: {
    message: {
      ko: '유효하지 않은 로케일입니다.',
      en: 'Invalid locale.',
    },
    exception: BadRequestException,
  },
  VALUE_REQUIRED: {
    message: {
      ko: '번역 값이 필요합니다.',
      en: 'Translation value is required.',
    },
    exception: BadRequestException,
  },
  TRANSLATION_ALREADY_EXISTS: {
    message: {
      ko: '이미 존재하는 번역 식별자입니다.',
      en: 'A translation with the same identifier already exists.',
    },
    exception: BadRequestException,
  },
  TRANSLATION_NOT_FOUND: {
    message: {
      ko: '번역을 찾을 수 없습니다.',
      en: 'Translation not found.',
    },
    exception: NotFoundException,
  },
});

export const BulkTranslationsAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
