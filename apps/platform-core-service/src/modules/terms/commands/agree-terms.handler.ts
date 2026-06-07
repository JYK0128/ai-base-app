import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Member, TermsConsent, TermsConsentRepository, TermsVersion, TermsVersionRepository } from '@pkg/database';

import { getCurrentPublishedVersion, mapTermsConsentResponse, type TermsConsentResponse } from '../terms.helper';
import { AgreeTermsCommand } from './agree-terms.command';
import { AgreeTermsAsserter } from './agree-terms.error';

/**
 * 약관 동의 핸들러
 */
@CommandHandler(AgreeTermsCommand)
export class AgreeTermsHandler implements ICommandHandler<AgreeTermsCommand> {
  private readonly Asserter = AgreeTermsAsserter;

  constructor(
    @InjectRepository(TermsVersion)
    private readonly termsVersionRepo: TermsVersionRepository,
    @InjectRepository(TermsConsent)
    private readonly termsConsentRepo: TermsConsentRepository,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: AgreeTermsCommand): Promise<TermsConsentResponse> {
    const termsVersion = await this.identifyTermsVersion(command.termsVersionId);
    await this.validateTermsVersion(termsVersion, command.organizationId);
    return this.processConsent(termsVersion, command);
  }

  /**
   * STEP 1: 약관 버전 식별
   */
  private async identifyTermsVersion(termsVersionId: string): Promise<TermsVersion> {
    const termsVersion = await this.termsVersionRepo.findOne(
      { id: termsVersionId },
      { populate: ['termsDocument', 'termsDocument.organization', 'termsDocument.versions'] },
    );

    return this.Asserter.assert(termsVersion, 'TERMS_VERSION_NOT_FOUND');
  }

  /**
   * STEP 2: 동의 가능 여부 검증
   */
  private async validateTermsVersion(termsVersion: TermsVersion, organizationId?: string) {
    await this.Asserter.throwIf(!termsVersion.isPublished, 'TERMS_VERSION_NOT_PUBLISHED');
    await this.Asserter.throwIf(!termsVersion.termsDocument.isPublished, 'TERMS_VERSION_NOT_PUBLISHED');
    await this.Asserter.throwIf(termsVersion.termsDocument.isDeprecated, 'TERMS_VERSION_NOT_PUBLISHED');

    const currentVersion = getCurrentPublishedVersion(termsVersion.termsDocument.versions.getItems());
    await this.Asserter.throwIf(!currentVersion || currentVersion.id !== termsVersion.id, 'TERMS_VERSION_NOT_EFFECTIVE');

    if (organizationId && termsVersion.termsDocument.organization?.id && termsVersion.termsDocument.organization.id !== organizationId) {
      await this.Asserter.throw('TERMS_DOCUMENT_MISMATCH');
    }
  }

  /**
   * STEP 3: 약관 동의 처리
   */
  private processConsent(
    termsVersion: TermsVersion,
    command: AgreeTermsCommand,
  ): TermsConsentResponse {
    const member = this.em.getReference(Member, command.memberId);

    const consent = this.termsConsentRepo.create({
      member,
      termsVersion,
      agreed: true,
    });

    this.em.persist(consent);
    return mapTermsConsentResponse(consent);
  }
}
