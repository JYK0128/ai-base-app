import { Injectable } from '@nestjs/common';
import { EntityManager, Member, TermsConsent, TermsDocument, TermsDocumentStatus, TermsVersion, TermsVersionStatus } from '@pkg/database';

import { AgreeTermsAsserter } from './agreements/agree-terms.error';
import type { MemberTermsConsentResponseDto } from './queries/get-terms-document.response.dto';

type AgreementStateInput = {
  memberId: string
  organizationId?: string | null
};

type AgreementState = {
  agreedTermsVersionIds: string[]
  mustAcceptTerms: boolean
};

function getCurrentPublishedVersion(versions: TermsVersion[]): TermsVersion | undefined {
  return [...versions]
    .filter((version) => version.status === TermsVersionStatus.PUBLISHED && version.effectiveAt.getTime() <= Date.now())
    .sort((left, right) => right.effectiveAt.getTime() - left.effectiveAt.getTime())[0];
}

@Injectable()
export class TermsAgreementService {
  constructor(private readonly em: EntityManager) {}

  async resolveAgreementState({ memberId, organizationId }: AgreementStateInput): Promise<AgreementState> {
    const activeTerms = await this.loadActiveTerms(organizationId);
    const currentVersionIds = activeTerms
      .map((term) => term.currentVersion?.id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);

    const consents = await this.em.find(TermsConsent, {
      member: memberId,
      agreed: true,
    }, {
      populate: ['termsVersion'],
    });

    const agreedTermsVersionIds = consents.map((consent) => consent.termsVersion.id);
    const mustAcceptTerms = currentVersionIds.some((versionId) => !agreedTermsVersionIds.includes(versionId));

    return {
      agreedTermsVersionIds,
      mustAcceptTerms,
    };
  }

  async agree(memberId: string, organizationId: string | null | undefined, termsVersionId: string): Promise<MemberTermsConsentResponseDto> {
    const activeTerms = await this.loadActiveTerms(organizationId ?? null);
    const currentTerm = activeTerms.find((term) => term.currentVersion?.id === termsVersionId);
    await AgreeTermsAsserter.throwIf(!currentTerm, 'TERMS_VERSION_NOT_AVAILABLE');

    const alreadyAgreed = await this.em.findOne(TermsConsent, {
      member: memberId,
      termsVersion: termsVersionId,
      agreed: true,
    }, {
      populate: ['termsVersion'],
    });

    if (alreadyAgreed) {
      return this.toResponse(alreadyAgreed);
    }

    const termsConsent = this.em.create(TermsConsent, {
      member: this.em.getReference(Member, memberId),
      termsVersion: this.em.getReference(TermsVersion, termsVersionId),
      agreed: true,
    });

    this.em.persist(termsConsent);
    await this.em.flush();

    return this.toResponse(termsConsent);
  }

  private async loadActiveTerms(organizationId?: string | null) {
    const documents = await this.em.find(TermsDocument, {
      status: TermsDocumentStatus.PUBLISHED,
      ...(organizationId
        ? {
          $or: [
            { organization: null },
            { organization: organizationId },
          ],
        }
        : {
          organization: null,
        }),
    }, {
      populate: ['organization', 'versions'],
      orderBy: { createdAt: 'DESC' },
    });

    return documents
      .filter((document) => !document.isDeprecated)
      .map((document) => ({
        document,
        currentVersion: getCurrentPublishedVersion(document.versions.getItems()),
      }))
      .filter((term) => !!term.currentVersion);
  }

  private toResponse(consent: TermsConsent): MemberTermsConsentResponseDto {
    return {
      id: consent.id,
      agreed: consent.agreed,
      agreedAt: consent.createdAt.toISOString(),
    };
  }
}
