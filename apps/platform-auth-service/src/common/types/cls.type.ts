declare module 'nestjs-cls' {
  interface ClsStore {
    /** 추적 ID (서비스 간 공유) */
    traceId: string
    /** 요청 ID (서비스 내부 고유) */
    requestId: string
    /** 사용자 IP */
    clientIp: string
    /** 브라우저 세션 ID (쿠키) */
    sid: string
    /** 사용자 고유 ID (UUID) */
    id?: string
    /** 테넌트 ID */
    tenantId?: string
  }
}
