import { BadRequestException, NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

/**
 * 약관 동의 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({
  TERMS_VERSION_NOT_FOUND: {
    message: '약관 버전을 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  TERMS_VERSION_NOT_PUBLISHED: {
    message: '게시된 약관 버전만 동의할 수 있습니다.',
    exception: BadRequestException,
  },
  TERMS_VERSION_NOT_EFFECTIVE: {
    message: '아직 효력이 발생하지 않은 약관 버전입니다.',
    exception: BadRequestException,
  },
  TERMS_DOCUMENT_MISMATCH: {
    message: '조직 컨텍스트가 약관 문서와 일치하지 않습니다.',
    exception: BadRequestException,
  },
});

/**
 * 약관 동의 에러 단언자
 */
export const AgreeTermsAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
