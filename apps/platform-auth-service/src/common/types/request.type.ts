import type { Request } from 'express';
import type { JWTPayload as JoseJWTPayload } from 'jose';

export interface JWTPayload extends JoseJWTPayload {
  sub: string
  organizationId?: string
  typ?: 'access' | 'refresh'
  mustChangePassword?: boolean
  roles?: string[]
  permissions?: string[]
}

export interface AppRequest extends Request {
  sid: string
  traceId: string
  requestId: string
  jwt?: JWTPayload
}
