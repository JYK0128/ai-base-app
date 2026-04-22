import type { IncomingHttpHeaders } from 'node:http';

import type { Request } from 'express';

export interface JWTPayload {
  sub: string
  email: string
  tenantId?: string
  sid: string // Session ID for single session enforcement
  passwordChangeRequired?: boolean
  [key: string]: unknown
}

export interface ExtendedRequest extends Request {
  requestId: string
  traceId: string
  user?: JWTPayload
  // headers 속성을 확장하여 커스텀 헤더 타입을 명시
  headers: IncomingHttpHeaders & {
    'x-request-id'?: string
    'x-trace-id'?: string
  }
}
