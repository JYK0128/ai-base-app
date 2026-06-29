import { sql } from '@mikro-orm/postgresql';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TermsConsent, TermsDocument, TermsVersion, TermsVersionStatus } from '@pkg/database';
import type { AuthMemberContext, AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { PendingTermListContract } from './pending-term-list.contract';
import { PendingTermListItem, PendingTermListResponseDto } from './pending-term-list.response.dto';

@QueryHandler(PendingTermListContract)
export class PendingTermListHandler implements IQueryHandler<PendingTermListContract> {
  constructor(
    private readonly cls: ClsService,
  ) {}

  async execute(): Promise<PendingTermListResponseDto> {
    const organization = this.identifyOrganization();
    const member = this.identifyMember();
    this.verifyPendingTerms(organization, member);
    return this.processList(organization, member);
  }

  private identifyOrganization(): AuthOrganizationContext {
    return this.cls.get<AuthOrganizationContext>('organization');
  }

  private identifyMember(): AuthMemberContext {
    return this.cls.get<AuthMemberContext>('member');
  }

  private verifyPendingTerms(
    _organization: AuthOrganizationContext,
    _member: AuthMemberContext,
  ): void {
    // 미동의 약관 목록 조회 정책 검증 영역
  }

  private async processList(
    organization: AuthOrganizationContext,
    member: AuthMemberContext,
  ): Promise<PendingTermListResponseDto> {
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
        'sub_tc.member': member.id,
        'sub_tc.termsVersion': sql`tv.id`,
      })
      .getNativeQuery();

    const activeTerms = await TermsDocument
      .getQueryBuilder('td')
      .leftJoin('td.versions', 'tv')
      .leftJoin('tv.consents', 'tc', {
        'tc.member': member.id,
        'tc.createdAt': { $in: latestConsentSubquery },
      })
      .where({
        'required': true,
        'metadata': { publishedAt: { $ne: null } },
        '$or': [
          { organization: null },
          { organization: organization.id },
        ],
        'tv.effectiveAt': { $in: latestVersionSubquery },
      })
      .select([
        `td.id as documentId`,
        `tv.id as versionId`,
        `td.organization as organizationId`,
        `td.title as title`,
        `tv.label as version`,
        `td.required as required`,
        `tv.content as content`,
        sql`COALESCE(tc.agreed, false)`.as('agreed'),
      ])
      .orderBy({ 'td.createdAt': 'DESC' })
      .execute<PendingTermListItem[]>();

    const pendingTerms = activeTerms.filter((term) => term.required && !term.agreed);

    return new PendingTermListResponseDto({
      items: pendingTerms.map((term) => new PendingTermListItem(term)),
    });
  }
}
