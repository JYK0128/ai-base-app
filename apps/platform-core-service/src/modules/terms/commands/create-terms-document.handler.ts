import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TermsDocument, TermsDocumentRepository, TermsDocumentStatus } from '@pkg/database';

import { CreateTermsDocumentAsserter, CreateTermsDocumentCommand } from './create-terms-document.helpers';

/**
 * 약관 문서 생성 핸들러
 */
@CommandHandler(CreateTermsDocumentCommand)
export class CreateTermsDocumentHandler implements ICommandHandler<CreateTermsDocumentCommand> {
  private readonly Asserter = CreateTermsDocumentAsserter;

  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: TermsDocumentRepository,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: CreateTermsDocumentCommand): Promise<TermsDocument> {
    return this.processCreation(command);
  }

  /**
   * STEP 1: 약관 문서 생성
   */
  private processCreation(command: CreateTermsDocumentCommand): TermsDocument {
    const termsDocument = this.termsDocumentRepo.create({
      code: command.code,
      title: command.title,
      required: command.required,
      status: TermsDocumentStatus.DRAFT,
      organization: command.organizationId,
    });

    this.em.persist(termsDocument);
    return termsDocument;
  }
}
