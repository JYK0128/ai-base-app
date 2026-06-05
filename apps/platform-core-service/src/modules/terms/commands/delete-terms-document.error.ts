import { BadRequestException, NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

/**
 * 약관 문서 물리 삭제 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({
  DOCUMENT_NOT_FOUND: {
    message: '약관 문서를 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  DOCUMENT_HAS_ACTIVE_VERSION: {
    message: '현재 효력 중인 약관이 있어 물리 삭제할 수 없습니다.',
    exception: BadRequestException,
  },
});

/**
 * 약관 문서 물리 삭제 에러 단언자
 */
export const DeleteTermsDocumentAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
