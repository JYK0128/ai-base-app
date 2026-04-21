declare module 'nestjs-cls' {
  interface ClsStore {
    // 1. 추적 정보
    traceId: string
    requestId: string
    sessionId: string

    // 2. 네트워크 & 보안 정보
    ip: string
    realIp: string
    userAgent: string
    referer: string

    // 3. 요청 정보
    method: string
    url: string
    startTime: number
    acceptLanguage: string

    // 4. 사용자 정보 (로그인 시 채워짐)
    userId?: string
    tenantId?: string
  }
}
