import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Manager, ManagerTermsConsent, ManagerTermsConsentRepository, Organization, TermsVersion, TermsVersionRepository } from '@pkg/database';

import { AgreeTermsAsserter, AgreeTermsCommand } from './agree-terms.helpers';

/**
 * 약관 동의 핸들러
 */
@CommandHandler(AgreeTermsCommand)
export class AgreeTermsHandler implements ICommandHandler<AgreeTermsCommand> {
  private readonly Asserter = AgreeTermsAsserter;

  constructor(
    @InjectRepository(TermsVersion)
    private readonly termsVersionRepo: TermsVersionRepository,
    @InjectRepository(ManagerTermsConsent)
    private readonly managerTermsConsentRepo: ManagerTermsConsentRepository,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: AgreeTermsCommand): Promise<ManagerTermsConsent> {
    const { termsVersionId } = command;

    const termsVersion = await this.identifyTermsVersion(termsVersionId);

    return this.processConsent(termsVersion, command);
  }

  /**
   * STEP 1: 약관 버전 식별
   */
  private async identifyTermsVersion(termsVersionId: string): Promise<TermsVersion> {
    return await this.Asserter.assert(
      this.termsVersionRepo.findOne({ id: termsVersionId }),
      'TERMS_VERSION_NOT_FOUND',
    );
  }

  /**
   * STEP 2: 약관 동의 처리
   */
  private processConsent(termsVersion: TermsVersion, command: AgreeTermsCommand): ManagerTermsConsent {
    const consent = this.managerTermsConsentRepo.create({
      manager: this.em.getReference(Manager, command.managerId),
      organization: command.organizationId ? this.em.getReference(Organization, command.organizationId) : undefined,
      termsVersion,
      agreed: true,
      ipAddress: command.ipAddress,
      userAgent: command.userAgent,
    });

    this.em.persist(consent);
    return consent;
  }
}
