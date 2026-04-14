import type { IncomingHttpHeaders } from 'node:http';

import type { Request } from 'express';

export interface ExtendedRequest extends Request {
  requestId: string
  traceId: string
  // headers 속성을 확장하여 커스텀 헤더 타입을 명시
  headers: IncomingHttpHeaders & {
    'x-request-id'?: string
    'x-trace-id'?: string
  }
}
