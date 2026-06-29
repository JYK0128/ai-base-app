import { randomUUID } from 'node:crypto';

import { sql } from '@mikro-orm/core';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { MemberAccount, TermsConsent, TermsDocument, TermsVersion, TermsVersionStatus } from '@pkg/database';
import type { AuthAccountContext, AuthMemberContext, AuthOrganizationContext, AuthTermsSnapshotContext } from '@pkg/shared/server';
import { NextFunction, Response } from 'express';
import { ClsService } from 'nestjs-cls';

import type { AppRequest } from '../types/request.type';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  constructor(
    private readonly cls: ClsService,
  ) {}

  async use(req: AppRequest, res: Response, next: NextFunction) {
    if (this.cls.isActive()) {
      this.setTraceContext(req, res);
      this.setClientContext(req, res);
      await this.setUserContext(req, res);
    }

    next();
  }

  /**
   * 추적 컨텍스트 설정
   */
  private setTraceContext(req: AppRequest, res: Response) {
    const sid = req.sessionID ?? randomUUID();

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
  }

  /**
   * 클라이언트 컨텍스트 설정
   */
  private setClientContext(req: AppRequest, _res: Response) {
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
  private async setUserContext(req: AppRequest, _res: Response) {
    const accountId = req.session.accountId;
    if (!accountId) {
      return;
    }

    const account = await MemberAccount.findOne(
      { id: accountId },
      { populate: ['member.organization', 'member.roles.role.permissions.resource'] },
    );

    if (!account) {
      return;
    }

    const terms = await this.identifyTermsContext(account);

    this.cls.set('account', this.toAccountContext(account));
    this.cls.set('member', this.toMemberContext(account));
    this.cls.set('organization', this.toOrganizationContext(account));
    this.cls.set('permissions', this.toPermissionsContext(account));
    this.cls.set('terms', terms);
  }

  private toAccountContext(account: MemberAccount): AuthAccountContext {
    return {
      id: account.id,
      email: account.email,
      status: account.status,
      lastLoginAt: account.lastLoginAt ?? null,
      passwordExpiresAt: account.passwordExpiresAt,
      isDormant: account.isDormant,
      isPasswordExpired: account.isPasswordExpired,
    };
  }

  private toMemberContext(account: MemberAccount): AuthMemberContext {
    return {
      id: account.member.id,
      name: account.member.name,
      status: account.member.status,
    };
  }

  private toPermissionsContext(account: MemberAccount): string[] {
    return account.member.roles.map((role) => role.role.permissions.map((permission) => permission.code)).flat();
  }

  private toOrganizationContext(account: MemberAccount): AuthOrganizationContext {
    const organization = account.member.organization;

    return {
      id: organization.id,
      code: organization.code,
      name: organization.name,
      email: organization.email,
      status: organization.status,
    };
  }

  private async identifyTermsContext(account: MemberAccount): Promise<AuthTermsSnapshotContext[]> {
    const memberId = account.member.id;
    const organizationId = account.member.organization.id;

    const latestVersionSubquery = TermsVersion
      .getQueryBuilder('sub_tv')
      .select(sql`MAX(sub_tv."effectiveAt")`)
      .where({
        'sub_tv.termsDocument': sql`td.id`,
        'sub_tv.status': TermsVersionStatus.PUBLISHED,
        'sub_tv.effectiveAt': { $lte: new Date() },
      })
      .getNativeQuery();

    const latestConsentSubquery = TermsConsent
      .getQueryBuilder('sub_tc')
      .select(sql`MAX(sub_tc."createdAt")`)
      .where({
        'sub_tc.member': memberId,
        'sub_tc.termsVersion': sql`tv.id`,
      })
      .getNativeQuery();

    const result = TermsDocument
      .getQueryBuilder('td')
      .leftJoin('td.versions', 'tv')
      .leftJoin('tv.consents', 'tc', {
        'tc.member': memberId,
        'tc.createdAt': { $in: latestConsentSubquery },
      })
      .where({
        'metadata': { publishedAt: { $ne: null } },
        '$or': [
          { organization: null },
          { organization: organizationId },
        ],
        'tv.effectiveAt': { $in: latestVersionSubquery },
      })
      .select([
        `td.id as documentId`,
        `tv.id as versionId`,
        `td.required as required`,
        `td.title as title`,
        `tv.label as version`,
        sql`COALESCE(tc.agreed, false)`.as('agreed'),
      ])
      .orderBy({ 'td.createdAt': 'DESC' })
      .execute<AuthTermsSnapshotContext[]>();

    return result;
  }
}
