import { BadRequestException, NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

/**
 * 약관 문서 폐기 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({
  DOCUMENT_NOT_FOUND: {
    message: '약관 문서를 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  DOCUMENT_HAS_NO_ACTIVE_VERSION: {
    message: '현재 효력 중인 약관이 없어 폐기할 수 없습니다.',
    exception: BadRequestException,
  },
  DOCUMENT_DEPRECATION_EXISTS: {
    message: '이미 폐기 일정이 등록된 약관 문서입니다.',
    exception: BadRequestException,
  },
});

/**
 * 약관 문서 폐기 에러 단언자
 */
export const DeprecateTermsDocumentAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
