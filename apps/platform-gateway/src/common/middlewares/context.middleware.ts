import { randomUUID } from 'node:crypto';

import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Response } from 'express';
import { ClsService } from 'nestjs-cls';

import type { AppRequest, JWTPayload } from '../types/request.type';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  constructor(
    private readonly cls: ClsService,
    private readonly jwtService: JwtService,
  ) {}

  use(req: AppRequest, res: Response, next: NextFunction) {
    this.setTraceContext(req, res);
    this.setRequestContext(req);
    this.setUserContext(req);

    next();
  }

  private setTraceContext(req: AppRequest, res: Response) {
    const sid = req.cookies?.['sid'] || randomUUID();
    const traceId = req.headers['x-trace-id'] || randomUUID();
    const requestId = randomUUID();

    this.cls.set('sid', sid);
    this.cls.set('traceId', traceId);
    this.cls.set('requestId', requestId);

    res.setHeader('x-trace-id', traceId);
    res.setHeader('x-request-id', requestId);

    if (!req.cookies?.['sid']) {
      res.cookie('sid', sid, {
        httpOnly: true,
        path: '/',
        secure: req.secure,
        sameSite: 'lax',
      });
    }
  }

  private setRequestContext(req: AppRequest) {
    this.cls.set('clientIp', req.headers['x-real-ip'] || req.ip || '0.0.0.0');
    this.cls.set('userAgent', req.headers['user-agent']);
    this.cls.set('referer', req.headers['referer']);
    this.cls.set('method', req.method);
    this.cls.set('url', req.url);
    this.cls.set('startTime', Date.now());
    this.cls.set('acceptLanguage', req.headers['accept-language']);
  }

  private setUserContext(req: AppRequest) {
    const authHeader = req.headers['authorization'];
    if (typeof authHeader !== 'string') return;

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) return;

    try {
      const payload = this.jwtService.verify<JWTPayload>(token);
      this.cls.set('id', payload.sub);
      this.cls.set('organizationId', payload.organizationId);
    }
    catch {
      // 검증 실패 시 무시 (AuthGuard에서 처리)
    }
  }
}
