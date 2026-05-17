import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

/**
 * 공지사항 목록 조회 쿼리
 */
export class GetAnnouncementsQuery {
  constructor(
    public readonly isPublishedOnly?: boolean,
  ) {}
}

/**
 * 공지사항 목록 조회 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({});

/**
 * 공지사항 목록 조회 에러 단언자
 */
export const GetAnnouncementsAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
