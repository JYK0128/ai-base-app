import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Organization, TermsVersion, TermsVersionRepository, User, UserTermsConsent, UserTermsConsentRepository } from '@pkg/database';

export class AgreeTermsCommand {
  constructor(
    readonly userId: string,
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
    @InjectRepository(UserTermsConsent)
    private readonly userTermsConsentRepo: UserTermsConsentRepository,
    private readonly em: EntityManager,
  ) {}

  async execute(command: AgreeTermsCommand): Promise<UserTermsConsent> {
    const termsVersion = await this.termsVersionRepo.findOne({ id: command.termsVersionId });
    if (!termsVersion) throw new NotFoundException('Terms version not found');

    const consent = this.userTermsConsentRepo.create({
      user: this.em.getReference(User, command.userId),
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
