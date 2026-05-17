import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

/**
 * 활성 약관 목록 조회 쿼리
 */
export class GetActiveTermsQuery {
  constructor(readonly organizationId?: string) {}
}

/**
 * 활성 약관 목록 조회 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({});

/**
 * 활성 약관 목록 조회 에러 단언자
 */
export const GetActiveTermsAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
