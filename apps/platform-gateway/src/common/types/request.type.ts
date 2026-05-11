import type { IncomingHttpHeaders } from 'node:http';

import type { Request } from 'express';
export interface JWTPayload {
  sub: string
  organizationId?: string
  roles?: string[]
  permissions?: string[]
  [key: string]: unknown
}

export interface CustomCookies {
  sid: string
  [key: string]: unknown
}

export interface CustomHeader extends IncomingHttpHeaders {
  'x-trace-id': string
  'x-real-ip': string
}
export interface AppRequest extends Request {
  cookies: CustomCookies
  headers: CustomHeader
}
