import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Organization, TermsDocument, TermsDocumentRepository, TermsDocumentStatus } from '@pkg/database';

import { mapTermsDocumentResponse, type TermsDocumentResponse } from '../terms.mapper';
import { CreateTermsDocumentCommand } from './create-terms-document.command';
import { CreateTermsDocumentAsserter } from './create-terms-document.error';

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
  async execute(command: CreateTermsDocumentCommand): Promise<TermsDocumentResponse> {
    return this.processCreation(command);
  }

  /**
   * STEP 1: 약관 문서 생성
   */
  private async processCreation(command: CreateTermsDocumentCommand): Promise<TermsDocumentResponse> {
    const organization = command.organizationId
      ? await this.Asserter.assert(
        this.em.findOne(Organization, { id: command.organizationId }),
        'ORGANIZATION_NOT_FOUND',
      )
      : undefined;

    const termsDocument = this.termsDocumentRepo.create({
      code: command.code,
      title: command.title,
      required: command.required,
      status: TermsDocumentStatus.DRAFT,
      organization,
    });

    this.em.persist(termsDocument);
    return mapTermsDocumentResponse(termsDocument);
  }
}
