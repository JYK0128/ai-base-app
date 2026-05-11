import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TermsDocument, TermsDocumentRepository, TermsDocumentStatus, TermsVersion, TermsVersionRepository, TermsVersionStatus } from '@pkg/database';

export class CreateTermsVersionCommand {
  constructor(
    readonly termsDocumentId: string,
    readonly versionLabel: string,
    readonly contentMd: string,
    readonly publish: boolean,
  ) {}
}

@CommandHandler(CreateTermsVersionCommand)
export class CreateTermsVersionHandler implements ICommandHandler<CreateTermsVersionCommand> {
  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: TermsDocumentRepository,
    @InjectRepository(TermsVersion)
    private readonly termsVersionRepo: TermsVersionRepository,
    private readonly em: EntityManager,
  ) {}

  async execute(command: CreateTermsVersionCommand): Promise<TermsVersion> {
    const termsDocument = await this.termsDocumentRepo.findOne({ id: command.termsDocumentId });
    if (!termsDocument) throw new NotFoundException('Terms document not found');

    const alreadyExists = await this.termsVersionRepo.findOne({
      termsDocument: termsDocument.id,
      versionLabel: command.versionLabel,
    });
    if (alreadyExists) throw new BadRequestException('Version label already exists');

    const status = command.publish ? TermsVersionStatus.PUBLISHED : TermsVersionStatus.DRAFT;
    const termsVersion = this.termsVersionRepo.create({
      termsDocument,
      versionLabel: command.versionLabel,
      contentMd: command.contentMd,
      status,
      publishedAt: command.publish ? new Date() : null,
    });

    if (command.publish) {
      termsDocument.status = TermsDocumentStatus.PUBLISHED;
      termsDocument.latestVersionId = termsVersion.id;
    }

    await this.em.persistAndFlush([termsVersion, termsDocument]);
    return termsVersion;
  }
}
