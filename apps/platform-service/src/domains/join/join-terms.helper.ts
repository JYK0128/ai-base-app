import { sql } from '@mikro-orm/postgresql';
import { TermsConsent, TermsDocument, TermsVersion, TermsVersionStatus } from '@pkg/database';

export type JoinRequiredTerm = {
  documentId: string
  versionId: string
  organizationId: string | null
  required: boolean
  title: string
  version: string
  content: string
};

export async function findJoinRequiredTerms(organizationId: string): Promise<JoinRequiredTerm[]> {
  const now = new Date();
  const latestVersionSubquery = TermsVersion
    .getQueryBuilder('sub_tv')
    .select(sql`MAX(sub_tv."effectiveAt")`)
    .where({
      'sub_tv.termsDocument': sql`td.id`,
      'sub_tv.status': TermsVersionStatus.PUBLISHED,
      'sub_tv.effectiveAt': { $lte: new Date() },
    })
    .getNativeQuery();

  return TermsDocument
    .getQueryBuilder('td')
    .leftJoin('td.versions', 'tv')
    .where({
      $and: [
        { required: true },
        { metadata: { publishedAt: { $ne: null } } },
        {
          $or: [
            { metadata: { terminatedAt: null } },
            { metadata: { terminatedAt: { $gt: now } } },
          ],
        },
        {
          $or: [
            { organization: null },
            { organization: organizationId },
          ],
        },
        { 'tv.effectiveAt': { $in: latestVersionSubquery } },
      ],
    })
    .select([
      `td.id as documentId`,
      `tv.id as versionId`,
      `td.organization as organizationId`,
      `td.required as required`,
      `td.title as title`,
      `tv.label as version`,
      `tv.content as content`,
    ])
    .orderBy({ 'td.createdAt': 'DESC' })
    .execute<JoinRequiredTerm[]>();
}

export function createTermsConsents(
  memberId: string,
  terms: Array<{ termsVersionId: string, agreed: boolean }>,
): TermsConsent[] {
  return TermsConsent.createMany(terms.map((term) => ({
    member: memberId,
    termsVersion: term.termsVersionId,
    agreed: term.agreed,
    metadata: null,
  })));
}
