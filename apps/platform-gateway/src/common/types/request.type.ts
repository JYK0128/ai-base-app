/**
 * JWT 인증 토큰 페이로드 인터페이스
 * 외부에서 명시적으로 임포트하여 사용할 수 있도록 최상위에서 export 합니다.
 */
export interface JWTPayload {
  /** 사용자 식별자 (sub) */
  sub: string
  /** 사용자 이메일 */
  email: string
  /** 활성 테넌트 식별자 */
  tenantId?: string
  /** 세션 식별자 (단일 세션 검증용) */
  sid: string
  /** 비밀번호 변경 필요 여부 */
  passwordChangeRequired?: boolean
  /** 기타 페이로드 정보 */
  [key: string]: unknown
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** 파싱된 쿠키 정보 */
      cookies: Record<string, unknown> & {
        /** JWT 인증 토큰 */
        jwt?: string
        /** 세션 식별자 */
        sessionId?: string
      }

      /** 서비스 전용 커스텀 헤더 */
      headers: import('node:http').IncomingHttpHeaders & {
        /** 분산 트레이싱을 위한 트레이스 ID */
        'x-trace-id'?: string
        /** 활성 테넌트 ID */
        'x-tenant-id'?: string
        /** 클라이언트의 실제 IP 주소 */
        'x-real-ip'?: string
      }

      /** 인증된 사용자 정보 */
      user?: JWTPayload
    }
  }
}
