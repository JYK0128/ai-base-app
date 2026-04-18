import { randomUUID } from 'node:crypto';

import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    let sessionId = req.cookies?.['sessionId'] as string;

    if (!sessionId) {
      sessionId = randomUUID();
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        path: '/',
        secure: req.secure,
        sameSite: 'lax',
      });
      this.cls.set('sessionId', sessionId);
    }

    const traceId = this.cls.get('traceId') || randomUUID();
    const requestId = this.cls.get('requestId') || randomUUID();

    res.setHeader('x-trace-id', traceId);
    res.setHeader('x-request-id', requestId);

    next();
  }
}
