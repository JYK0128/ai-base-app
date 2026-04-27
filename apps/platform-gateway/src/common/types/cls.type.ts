declare module 'nestjs-cls' {
  interface ClsStore {
    // 1. 추적 정보
    /** 브라우저 세션 ID (쿠키) */
    sid: string
    traceId: string
    requestId: string
    clientIp: string
    userAgent?: string
    referer?: string

    // 2. 요청 정보
    method: string
    url: string
    startTime: number
    acceptLanguage?: string

    // 3. 사용자 정보
    /** 사용자 고유 ID (UUID) */
    id?: string
    /** 테넌트 ID */
    tenantId?: string
  }
}
