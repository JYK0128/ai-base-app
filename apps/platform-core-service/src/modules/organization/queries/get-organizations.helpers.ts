import { OrganizationStatus } from '@pkg/database';

import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

/**
 * 조직 목록 조회 쿼리
 */
export class GetOrganizationsQuery {
  constructor(
    public readonly status?: OrganizationStatus,
  ) {}
}

/**
 * 조직 목록 조회 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({});

/**
 * 조직 목록 조회 에러 단언자
 */
export const GetOrganizationsAsserter = ExceptionGuard
  .setMessages(ERROR_MESSAGES);
