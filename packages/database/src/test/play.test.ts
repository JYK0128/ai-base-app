import { RequestContext, sql } from '@mikro-orm/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Member, MemberAccount, MemberStatus, Organization, OrganizationRole, TermsDocument, TermsVersion } from '@/domains';
import type { PostgresTestContext } from '@/test/context';
import { createPostgresTestContext, destroyPostgresTestContext } from '@/test/context';

describe('Database Playground', () => {
  let context: PostgresTestContext;
  beforeAll(async () => {
    context = await createPostgresTestContext();
  }, 120_000);

  afterAll(async () => {
    if (context) {
      await destroyPostgresTestContext(context);
    }
  }, 120_000);

  it('should verify database connectivity and perform a simple query', async () => {
    const em = context.orm.em.fork();
    const result = await em.getConnection().execute('SELECT 1 as val');
    expect(result).toBeDefined();
    expect(result[0].val).toBe(1);
  });

  it('should select database using kysely', async () => {
    const em = context.orm.em.fork();
    const members = await em.find(Member, {});
    expect(Array.isArray(members)).toBe(true);
  });

  it('should test where clause filtering', async () => {
    const em = context.orm.em.fork();
    const activeMembers = await em.find(Member, { status: MemberStatus.ACTIVE });
    expect(Array.isArray(activeMembers)).toBe(true);
    activeMembers.forEach((member) => {
      expect(member.status).toBe('ACTIVE');
    });
  });

  it('test', async () => {
    await RequestContext.create(context.orm.em, async () => {
      const account = (await MemberAccount.find({})).at(0);
      if (!account) {
        throw new Error('계정이 없습니다.');
      }

      const latestEffectQuery = TermsVersion.getQueryBuilder('sub_tv');
      latestEffectQuery
        .select(sql`MAX(sub_tv."effectiveAt")`)
        .where({
          'sub_tv.termsDocument': sql`td.id`,
          'sub_tv.effectiveAt': { $lte: new Date() },
        });

      // =========================================================================
      // 메인 쿼리: 최신 약관 정보와 해당 약관 문서의 유저 최신 동의 정보 확인하기
      // =========================================================================
      const qb = TermsDocument.getQueryBuilder('td');
      const consents = await qb
        .leftJoinAndSelect('td.versions', 'tv')
        .leftJoinAndSelect('tv.consents', 'tc', { 'tc.member': account.member })
        .leftJoin('td.organization', 'org')
        .where({
          '$or': [
            { 'org.id': account.member.organization?.id },
            { 'org.id': null },
          ],
          'tv.effectiveAt': { $in: latestEffectQuery },
        })
        .orderBy({ 'td.required': 'DESC', 'td.code': 'ASC' })
        .select(['td.*', 'tv.*', 'tc.*'])
        .execute();

      console.log(JSON.stringify(consents, null, 2));
    });
    expect(true).toBe(true);
  });

  it('test2', async () => {
    await RequestContext.create(context.orm.em, async () => {
      const organization = (await Organization.find({})).at(0);
      if (!organization) {
        throw Error('');
      }

      const qb1 = OrganizationRole.getQueryBuilder('role');
      const _count = await qb1
        .leftJoin('role.assignments', 'assignment')
        .select([
          'role.id',
          sql`count(assignment.id)`.as('roleAssignmentCount'),
        ])
        .where({
          organization,
          deletedAt: null,
        })
        .groupBy('role.id')
        .execute();

      const _qb2 = OrganizationRole.getQueryBuilder('role')
        .leftJoinAndSelect('permissions', 'permission')
        .leftJoinAndSelect('permission.resource', 'resource')
        .where({
          organization,
          deletedAt: null,
        })
        .getResultList();
    });
    expect(true).toBe(true);
  });
});
