import { Request } from 'express';

export interface ExtendedRequest extends Request {
  requestId: string
  traceId: string
}
