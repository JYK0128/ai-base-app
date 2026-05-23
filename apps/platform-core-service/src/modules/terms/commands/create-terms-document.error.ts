import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

/**
 * 약관 문서 생성 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({});

/**
 * 약관 문서 생성 에러 단언자
 */
export const CreateTermsDocumentAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
