import { TicketStatus } from '@pkg/database';

import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

/**
 * 문의 티켓 목록 조회 쿼리
 */
export class GetTicketsQuery {
  constructor(
    public readonly organizationId?: string,
    public readonly status?: TicketStatus,
  ) {}
}

/**
 * 문의 티켓 목록 조회 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({});

/**
 * 문의 티켓 목록 조회 에러 단언자
 */
export const GetTicketsAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
