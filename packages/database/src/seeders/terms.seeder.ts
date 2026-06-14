/**
 * @file terms.seeder.ts
 * @package @pkg/database
 * @description 플랫폼 공용 약관 문서와 현재 효력 버전을 생성하는 시더입니다.
 */

import { createHash } from 'node:crypto';

import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { MemberAccount } from '../domains/platform/member/member.account.entity';
import { Organization } from '../domains/platform/organization/organization.entity';
import { TermsDocument, TermsDocumentStatus } from '../domains/platform/terms/terms.document.entity';
import { TermsVersion, TermsVersionStatus } from '../domains/platform/terms/terms.version.entity';

type TermsSeed = {
  code: string
  organizationCode: string | null
  title: string
  required: boolean
  versionLabel: string
  effectiveAt: Date
  content: string
};

const TERMS_SEEDS: TermsSeed[] = [
  {
    code: 'privacy',
    organizationCode: null,
    title: '개인정보 처리방침',
    required: true,
    versionLabel: 'v1.0.0',
    effectiveAt: new Date('2024-01-01T00:00:00.000Z'),
    content: `# 개인정보 처리방침

플랫폼은 이용자의 개인정보를 안전하게 보호합니다.

1. 수집 항목: 이름, 이메일, 소속 정보, 접속 기록
2. 이용 목적: 계정 관리, 서비스 제공, 문의 대응
3. 보관 기간: 법령 또는 내부 정책에 따라 보관 후 파기

자세한 내용은 관리자 정책에 따릅니다.`,
  },
  {
    code: 'terms',
    organizationCode: null,
    title: '이용약관',
    required: true,
    versionLabel: 'v1.0.0',
    effectiveAt: new Date('2024-01-01T00:00:00.000Z'),
    content: `# 이용약관

본 약관은 플랫폼 서비스 이용과 관련된 기본 조건을 정합니다.

1. 이용자는 계정 정보를 정확하게 입력해야 합니다.
2. 서비스 운영 정책과 관련 법령을 준수해야 합니다.
3. 운영상 필요할 경우 서비스 일부가 제한될 수 있습니다.

이용자는 본 약관에 동의한 후 서비스를 이용할 수 있습니다.`,
  },
  {
    code: 'platform-privacy',
    organizationCode: 'platform',
    title: '플랫폼 조직 개인정보 처리방침',
    required: true,
    versionLabel: 'v1.0.0',
    effectiveAt: new Date('2024-01-01T00:00:00.000Z'),
    content: `# 플랫폼 조직 개인정보 처리방침

플랫폼 조직은 운영 계정과 조직 데이터를 처리합니다.

1. 수집 항목: 이름, 이메일, 직책, 접속 기록
2. 이용 목적: 플랫폼 운영, 접근 제어, 문의 대응
3. 보관 기간: 관련 법령 및 내부 정책에 따라 보관 후 파기

플랫폼 관리자 정책에 따라 세부 운영됩니다.`,
  },
  {
    code: 'platform-terms',
    organizationCode: 'platform',
    title: '플랫폼 조직 이용약관',
    required: true,
    versionLabel: 'v1.0.0',
    effectiveAt: new Date('2024-01-01T00:00:00.000Z'),
    content: `# 플랫폼 조직 이용약관

본 약관은 플랫폼 조직 내부 운영 및 관리자 계정 사용에 적용됩니다.

1. 조직 사용자는 접근 권한 범위를 준수해야 합니다.
2. 관리자 계정은 승인된 목적에 한해 사용해야 합니다.
3. 보안 및 운영 상 필요할 경우 권한이 조정될 수 있습니다.

플랫폼 조직 서비스는 본 약관 동의 후 이용할 수 있습니다.`,
  },
];

export class TermsSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const adminAccount = await em.findOne(MemberAccount, { email: 'admin@platform.com' }, { populate: ['member'] });
    const creatorId = adminAccount?.member?.id;

    for (const seed of TERMS_SEEDS) {
      await this.upsertTermsDocument(em, seed, creatorId);
    }

    await em.flush();
  }

  private async upsertTermsDocument(em: EntityManager, seed: TermsSeed, creatorId?: string): Promise<void> {
    const organization = seed.organizationCode
      ? await em.findOne(Organization, { code: seed.organizationCode })
      : null;

    if (seed.organizationCode && !organization) {
      throw new Error(`Organization not found in TermsSeeder: ${seed.organizationCode}`);
    }

    const document = await em.findOne(TermsDocument, { code: seed.code });
    const persistedDocument = document ?? em.create(TermsDocument, {
      code: seed.code,
      title: seed.title,
      required: seed.required,
      createdBy: creatorId,
    });

    persistedDocument.organization = organization ?? undefined;
    persistedDocument.title = seed.title;
    persistedDocument.required = seed.required;
    persistedDocument.status = TermsDocumentStatus.PUBLISHED;
    persistedDocument.deprecatedAt = undefined;
    if (creatorId && !persistedDocument.createdBy) {
      persistedDocument.createdBy = creatorId;
    }

    const checksum = createHash('sha256').update(seed.content).digest('hex');
    const version = await em.findOne(TermsVersion, {
      termsDocument: persistedDocument,
      label: seed.versionLabel,
    });
    const persistedVersion = version ?? em.create(TermsVersion, {
      termsDocument: persistedDocument,
      label: seed.versionLabel,
      content: seed.content,
      checksum,
      effectiveAt: seed.effectiveAt,
      createdBy: creatorId,
    });

    persistedVersion.termsDocument = persistedDocument;
    persistedVersion.label = seed.versionLabel;
    persistedVersion.content = seed.content;
    persistedVersion.checksum = checksum;
    persistedVersion.status = TermsVersionStatus.PUBLISHED;
    persistedVersion.effectiveAt = seed.effectiveAt;
    if (creatorId && !persistedVersion.createdBy) {
      persistedVersion.createdBy = creatorId;
    }

    em.persist(persistedDocument);
    em.persist(persistedVersion);
  }
}
