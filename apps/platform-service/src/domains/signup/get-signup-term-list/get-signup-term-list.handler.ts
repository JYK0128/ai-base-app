import { sql } from '@mikro-orm/postgresql';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TermsDocument, TermsDocumentScope, TermsVersion, TermsVersionStatus } from '@pkg/database';

import { GetSignupTermListContract } from './get-signup-term-list.contract';
import { GetSignupTermListItem, GetSignupTermListResponseDto } from './get-signup-term-list.response.dto';

@QueryHandler(GetSignupTermListContract)
export class GetSignupTermListHandler implements IQueryHandler<GetSignupTermListContract> {
  async execute(): Promise<GetSignupTermListResponseDto> {
    return this.process();
  }

  private async process(): Promise<GetSignupTermListResponseDto> {
    const now = new Date();
    const latestVersionSubquery = TermsVersion
      .getQueryBuilder('sub_tv')
      .select(sql`MAX(sub_tv."effectiveAt")`)
      .where({
        'sub_tv.termsDocument': sql`td.id`,
        'sub_tv.status': TermsVersionStatus.PUBLISHED,
        'sub_tv.effectiveAt': { $lte: now },
      })
      .getNativeQuery();

    const signupTerms = await TermsDocument
      .getQueryBuilder('td')
      .leftJoin('td.versions', 'tv')
      .where({
        $and: [
          { organization: null },
          { metadata: { publishedAt: { $ne: null } } },
          {
            $or: [
              { metadata: { terminatedAt: null } },
              { metadata: { terminatedAt: { $gt: now } } },
            ],
          },
          { 'tv.effectiveAt': { $in: latestVersionSubquery } },
        ],
      })
      .select([
        `td.id as documentId`,
        `tv.id as versionId`,
        `td.organization as organizationId`,
        `td.title as title`,
        `tv.label as version`,
        `td.required as required`,
        `tv.content as content`,
      ])
      .orderBy({ 'td.createdAt': 'DESC' })
      .execute<GetSignupTermListItem[]>();

    return new GetSignupTermListResponseDto({
      items: signupTerms.map((term) => new GetSignupTermListItem({
        ...term,
        scope: TermsDocumentScope.PLATFORM,
      })),
    });
  }
}
