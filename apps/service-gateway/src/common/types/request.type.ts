import 'express';

import { IncomingHttpHeaders } from 'node:http';

declare module 'express' {
  interface Request {
    /** 파싱된 쿠키 정보 */
    cookies: Record<string, string | undefined> & {
      sessionId?: string
    }
    /** 서비스 전용 커스텀 헤더 */
    headers: IncomingHttpHeaders & {
      'x-trace-id'?: string
      'x-real-ip'?: string
      'user-agent'?: string
      'referer'?: string
      'accept-language'?: string
    }
  }
}
