import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TermsDocument, TermsDocumentRepository, TermsDocumentStatus, TermsGroupType } from '@pkg/database';

export class CreateTermsDocumentCommand {
  constructor(
    readonly groupType: TermsGroupType,
    readonly code: string,
    readonly title: string,
    readonly required: boolean,
    readonly organizationId?: string,
  ) {}
}

@CommandHandler(CreateTermsDocumentCommand)
export class CreateTermsDocumentHandler implements ICommandHandler<CreateTermsDocumentCommand> {
  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: TermsDocumentRepository,
    private readonly em: EntityManager,
  ) {}

  async execute(command: CreateTermsDocumentCommand): Promise<TermsDocument> {
    const termsDocument = this.termsDocumentRepo.create({
      groupType: command.groupType,
      code: command.code,
      title: command.title,
      required: command.required,
      status: TermsDocumentStatus.DRAFT,
      organization: command.organizationId,
    });

    await this.em.persistAndFlush(termsDocument);
    return termsDocument;
  }
}
