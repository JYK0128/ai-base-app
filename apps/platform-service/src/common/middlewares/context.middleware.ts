import { randomUUID } from 'node:crypto';

import { MikroORM } from '@mikro-orm/core';
import { raw } from '@mikro-orm/postgresql';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MemberAccount, TermsDocument, TermsVersion } from '@pkg/database';
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
    const clientIp = req.headers['x-real-ip'];

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
          account.populate(['member.organizationRoles.role.permissions.resource']),
        ]);
      }
      // 권한 목록
      const permissions = account.member.organizationRoles.map((role) => role.role.permissions.map((p) => p.code)).flat();

      const orgId = account.member.organization?.id ?? null;

      const subQb = TermsVersion.getQueryBuilder('sub_tv');
      subQb
        .select(raw('MAX(sub_tv."effectiveAt")'))
        .where({
          'sub_tv.termsDocument': raw('td.id'),
          'sub_tv.effectiveAt': { $lte: new Date() },
        });

      // =========================================================================
      // 메인 쿼리: 최신 약관 정보와 해당 약관 문서의 유저 최신 동의 정보 확인하기
      // =========================================================================
      const qb = TermsDocument.getQueryBuilder('td');
      const consents = await qb
        .leftJoinAndSelect('td.versions', 'tv')
        .leftJoinAndSelect('tv.consents', 'tc', { 'tc.member': account.member.id })
        .leftJoin('td.organization', 'org')
        .where({
          '$or': [
            { 'org.id': orgId },
            { 'org.id': null },
          ],
          'tv.effectiveAt': { $in: subQb },
        })
        .orderBy({ 'td.required': 'DESC', 'td.code': 'ASC' })
        .getResultList();

      // ID 및 권한 캐시 (하위 호환성 및 빠른 접근 목적)
      this.cls.set('accountId', account.id);
      this.cls.set('memberId', account.member.id);
      this.cls.set('organizationId', account.member.organization?.id);
      this.cls.set('permissions', permissions);

      // 리졸브된 도메인 엔티티 자체를 CLS에 저장
      this.cls.set('account', account);
      this.cls.set('member', account.member);
      this.cls.set('organization', account.member.organization);
      this.cls.set('termsConsents', consents);

      // TODO: 상태 정보 (mustAcceptTerms, agreedTermsVersionIds, isPasswordExpired 등) 생성 및 계산 로직 분리 필요
      const agreementState = await this.termsAgreementService.resolveAgreementState({
        memberId: account.member.id,
        organizationId,
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
