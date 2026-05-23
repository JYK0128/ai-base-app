import { BadRequestException, NotFoundException } from '@nestjs/common';

import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

/**
 * 약관 버전 생성 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({
  DOCUMENT_NOT_FOUND: {
    message: '약관 문서를 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  VERSION_ALREADY_EXISTS: {
    message: '해당 버전 레이블이 이미 존재합니다.',
    exception: BadRequestException,
  },
});

/**
 * 약관 버전 생성 에러 단언자
 */
export const CreateTermsVersionAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
