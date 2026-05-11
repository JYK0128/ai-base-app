import type { Request } from 'express';

export interface JWTPayload {
  sub: string
  organizationId?: string
  mustChangePassword?: boolean
  roles?: string[]
  permissions?: string[]
  [key: string]: unknown
}

export interface AppRequest extends Request {
  sid: string
  traceId: string
  requestId: string
  jwt?: JWTPayload
}
