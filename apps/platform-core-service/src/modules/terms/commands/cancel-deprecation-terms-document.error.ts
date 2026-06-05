import { BadRequestException, NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

/**
 * 약관 문서 폐기 예약 취소 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({
  DOCUMENT_NOT_FOUND: {
    message: '약관 문서를 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  DOCUMENT_DEPRECATION_NOT_SCHEDULED: {
    message: '취소할 폐기 예약이 없습니다.',
    exception: BadRequestException,
  },
});

/**
 * 약관 문서 폐기 예약 취소 에러 단언자
 */
export const CancelDeprecationTermsDocumentAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
