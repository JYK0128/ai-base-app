import { defineKeys } from '../../common/utils/type-guard';

/**
 * 요청/추적 컨텍스트의 기본 상태입니다.
 * gateway에서 생성하고, RPC payload를 통해 auth/core 서비스로 전파합니다.
 * db 로그 컨텍스트로도 사용됩니다.
 */
export interface AuthAccountContext {
  id: string
  email: string
  status: string
  lastLoginAt: Date | null
  passwordExpiresAt: Date
  isDormant: boolean
  isPasswordExpired: boolean
}

export interface AuthMemberContext {
  id: string
  name: string
  status: string
}

export interface AuthOrganizationContext {
  id: string
  code: string
  name: string
  email: string
  status: string
}

export interface AuthTermsSnapshotContext {
  documentId: string
  versionId: string
  required: boolean
  title: string
  version: string
  agreed: boolean
}

export interface AuthRequestContext {
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
}

export interface AuthSessionContext {
  /** 계정 스냅샷 */
  account?: AuthAccountContext
  /** 회원 스냅샷 */
  member?: AuthMemberContext
  /** 조직 스냅샷 */
  organization?: AuthOrganizationContext | null
  /** 현재 요청의 권한 목록 */
  permissions?: string[]
  /** 최신 약관 동의 상태 목록 */
  terms?: AuthTermsSnapshotContext[]
}

export type AuthContext = AuthRequestContext & AuthSessionContext;

export type ContextKey = keyof AuthContext;
export const REQUEST_CONTEXT_KEYS = [
  'sid',
  'traceId',
  'requestId',
  'clientIp',
  'userAgent',
  'referer',
  'method',
  'url',
  'acceptLanguage',
] as const;

export const SESSION_CONTEXT_KEYS = [
  'account',
  'member',
  'organization',
  'permissions',
  'terms',
] as const;

export const CONTEXT_KEYS = defineKeys<ContextKey>()([
  ...REQUEST_CONTEXT_KEYS,
  ...SESSION_CONTEXT_KEYS,
] as const);
