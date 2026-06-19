import { randomUUID } from 'node:crypto';

import { MikroORM } from '@mikro-orm/core';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MemberAccount } from '@pkg/database';
import { NextFunction, Response } from 'express';
import type { JWTPayload } from 'jose';
import { ClsService } from 'nestjs-cls';

import { TermsAgreementService } from '@/domains/terms/terms-agreement.service';

import type { AppRequest } from '../types/request.type';
import { createCookieOptions } from '../utils/cookie';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  constructor(
    private readonly cls: ClsService,
    private readonly jwtService: JwtService,
    private readonly orm: MikroORM,
    private readonly termsAgreementService: TermsAgreementService,
  ) {}

  async use(req: AppRequest, res: Response, next: NextFunction) {
    if (!this.cls.isActive()) {
      next();
      return;
    }
    this.setTraceContext(req, res);
    this.setClientContext(req);
    await this.setUserContext(req);

    next();
  }

  /**
   * 추적 컨텍스트 설정
   */
  private setTraceContext(req: AppRequest, res: Response) {
    let sid = req.cookies?.['sid'];
    if (!sid) {
      sid = randomUUID();
    }

    let traceId = req.headers['x-trace-id'];
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

  /**
   * 클라이언트 컨텍스트 설정
   */
  private setClientContext(req: AppRequest) {
    // Accept-Language 헤더 분석 및 'ko' | 'en' 로케일 조기 결정
    const acceptLanguageHeader = req.headers['accept-language'];
    let acceptLanguage = 'en';
    if (acceptLanguageHeader) {
      acceptLanguage = acceptLanguageHeader.split(',')[0]?.trim().toLowerCase();
    }
    const clientIp = req.headers['x-real-ip'] ?? req.ip ?? '0.0.0.0';

    this.cls.set('clientIp', clientIp);
    this.cls.set('userAgent', req.headers['user-agent']);
    this.cls.set('referer', req.headers['referer']);
    this.cls.set('method', req.method);
    this.cls.set('url', req.url);
    this.cls.set('acceptLanguage', acceptLanguage);
  }

  /**
   * 유저 컨텍스트 설정
   */
  private async setUserContext(req: AppRequest) {
    // 인증토큰 추출
    const authHeader = req.headers['authorization'];
    if (!authHeader) return;

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) return;

    try {
      // 토큰 검증 및 발급자 확인
      const payload = this.jwtService.verify<JWTPayload>(token);
      const accountId = payload.sub;
      if (!accountId) return;

      // 계정 및 추가정보 조회
      const account = await MemberAccount.findOne(
        { id: accountId },
        { populate: ['member.organization'] },
      );
      if (!account) return;
      if (account.member) {
        await Promise.all([
          account.populate(['member.roles.role.permissions.resource']),
        ]);
      }
      // 권한 목록
      const permissions = account.member.roles.map((role) => role.role.permissions.map((p) => p.code)).flat();

      // ID 및 권한 캐시
      this.cls.set('accountId', account.id);
      this.cls.set('memberId', account.member.id);
      this.cls.set('organizationId', account.member.organization.id);
      this.cls.set('permissions', permissions);

      const agreementState = await this.termsAgreementService.resolveAgreementState({
        memberId: account.member.id,
        organizationId: account.member.organization.id,
      });

      this.cls.set('agreedTermsVersionIds', agreementState.agreedTermsVersionIds);
      this.cls.set('isPasswordExpired', account.isPasswordExpired);
      this.cls.set('mustAcceptTerms', agreementState.mustAcceptTerms);
    }
    catch {
      // 검증 실패 시 무시 (AuthGuard에서 처리)
    }
  }
}
