import { NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

/**
 * 약관 문서 상세 조회 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({
  DOCUMENT_NOT_FOUND: {
    message: '약관 문서를 찾을 수 없습니다.',
    exception: NotFoundException,
  },
});

/**
 * 약관 문서 상세 조회 에러 단언자
 */
export const GetTermsDocumentAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
