import { defineKeys } from '../../common/utils/type-guard';

/**
 * 요청/추적 컨텍스트의 기본 상태입니다.
 * gateway에서 생성하고, RPC payload를 통해 auth/core 서비스로 전파합니다.
 * db 로그 컨텍스트로도 사용됩니다.
 */
export interface ServerContext {
  /** 브라우저 세션 ID (쿠키) */
  sid: string
  /** 추적 ID (서비스 간 공유) */
  traceId: string
  /** 요청 ID (서비스 내부 고유) */
  requestId: string

  /** 사용자 IP */
  clientIp: string
  /** 요청 메서드 */
  method: string
  /** 요청 URL */
  url: string

  /** 클라이언트 식별자 */
  userAgent?: string
  /** 클라이언트 유입 경로 */
  referer?: string
  /** 클라이언트 선호 언어 */
  acceptLanguage?: string

  /** 계정 ID */
  accountId?: string
  /** 회원 ID */
  memberId?: string
  /** 조직 ID */
  organizationId?: string
}

export type ContextKey = keyof ServerContext;
export const CONTEXT_KEYS = defineKeys<ContextKey>()([
  'sid',
  'traceId',
  'requestId',
  'clientIp',
  'userAgent',
  'referer',
  'method',
  'url',
  'accountId',
  'memberId',
  'organizationId',
  'acceptLanguage',
] as const);
