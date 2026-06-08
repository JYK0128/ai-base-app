import { randomUUID } from 'node:crypto';

import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Response } from 'express';
import type { JWTPayload } from 'jose';
import { ClsService } from 'nestjs-cls';

import type { AppRequest } from '../types/request.type';
import { createCookieOptions } from '../utils/cookie';

function getHeaderValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  constructor(
    private readonly cls: ClsService,
    private readonly jwtService: JwtService,
  ) {}

  use(req: AppRequest, res: Response, next: NextFunction) {
    this.setTraceContext(req, res);
    this.setClientContext(req);
    this.setUserContext(req);

    next();
  }

  private setTraceContext(req: AppRequest, res: Response) {
    let sid = getHeaderValue(req.cookies?.['sid']);
    if (!sid) {
      sid = randomUUID();
    }

    let traceId = getHeaderValue(req.headers['x-trace-id']);
    if (!traceId) {
      traceId = randomUUID();
    }

    const requestId = randomUUID();
    this.cls.set('sid', sid);
    this.cls.set('traceId', traceId);
    this.cls.set('requestId', requestId);

    res.setHeader('x-trace-id', traceId);
    res.setHeader('x-request-id', requestId);

    if (!req.cookies?.['sid']) {
      res.cookie('sid', sid, createCookieOptions());
    }
  }

  private setClientContext(req: AppRequest) {
    // Accept-Language 헤더 분석 및 'ko' | 'en' 로케일 조기 결정
    const acceptLanguageHeader = getHeaderValue(req.headers['accept-language']);
    let resolvedLocale = 'ko';

    if (acceptLanguageHeader) {
      if (acceptLanguageHeader.split(',')[0]?.trim().toLowerCase().startsWith('en')) {
        resolvedLocale = 'en';
      }
    }

    let clientIp = getHeaderValue(req.headers['x-real-ip']);
    if (!clientIp) {
      clientIp = req.ip;
    }
    if (!clientIp) {
      clientIp = '0.0.0.0';
    }

    this.cls.set('clientIp', clientIp);
    this.cls.set('userAgent', getHeaderValue(req.headers['user-agent']));
    this.cls.set('referer', getHeaderValue(req.headers['referer']));
    this.cls.set('method', req.method);
    this.cls.set('url', req.url);
    this.cls.set('acceptLanguage', resolvedLocale);
  }

  private setUserContext(req: AppRequest) {
    const authHeader = req.headers['authorization'];
    if (typeof authHeader !== 'string') return;

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer') return;
    if (!token) return;

    try {
      const payload = this.jwtService.verify<JWTPayload>(token);

      if (payload.accountId) {
        this.cls.set('accountId', payload.accountId);
      }
      if (payload.memberId) {
        this.cls.set('memberId', payload.memberId);
      }
      if (payload.organizationId) {
        this.cls.set('organizationId', payload.organizationId);
      }
    }
    catch {
      // 검증 실패 시 무시 (AuthGuard에서 처리)
    }
  }
}
