import { BadRequestException, NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

/**
 * 약관 버전 수정 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({
  VERSION_NOT_FOUND: {
    message: '약관 버전을 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  VERSION_ALREADY_EXISTS: {
    message: '해당 버전 라벨이 이미 존재합니다.',
    exception: BadRequestException,
  },
  VERSION_NOT_EDITABLE: {
    message: '수정 가능한 약관 버전이 아닙니다.',
    exception: BadRequestException,
  },
  DOCUMENT_DEPRECATED: {
    message: '폐기된 약관 문서는 버전을 수정할 수 없습니다.',
    exception: BadRequestException,
  },
});

/**
 * 약관 버전 수정 에러 단언자
 */
export const UpdateTermsVersionAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
