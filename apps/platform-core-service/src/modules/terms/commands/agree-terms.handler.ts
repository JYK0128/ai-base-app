import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Manager, ManagerTermsConsent, ManagerTermsConsentRepository, Organization, TermsVersion, TermsVersionRepository } from '@pkg/database';

export class AgreeTermsCommand {
  constructor(
    readonly managerId: string,
    readonly termsVersionId: string,
    readonly organizationId?: string,
    readonly source?: string,
    readonly ipAddress?: string,
    readonly userAgent?: string,
  ) {}
}

@CommandHandler(AgreeTermsCommand)
export class AgreeTermsHandler implements ICommandHandler<AgreeTermsCommand> {
  constructor(
    @InjectRepository(TermsVersion)
    private readonly termsVersionRepo: TermsVersionRepository,
    @InjectRepository(ManagerTermsConsent)
    private readonly managerTermsConsentRepo: ManagerTermsConsentRepository,
    private readonly em: EntityManager,
  ) {}

  async execute(command: AgreeTermsCommand): Promise<ManagerTermsConsent> {
    const termsVersion = await this.termsVersionRepo.findOne({ id: command.termsVersionId });
    if (!termsVersion) throw new NotFoundException('Terms version not found');

    const consent = this.managerTermsConsentRepo.create({
      manager: this.em.getReference(Manager, command.managerId),
      organization: command.organizationId ? this.em.getReference(Organization, command.organizationId) : undefined,
      termsVersion,
      agreed: true,
      agreedAt: new Date(),
      source: command.source,
      ipAddress: command.ipAddress,
      userAgent: command.userAgent,
    });

    await this.em.persistAndFlush(consent);
    return consent;
  }
}
