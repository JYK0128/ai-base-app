import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TermsVersionStatus } from '@pkg/database';

import { AgreeTermsCommand, CancelDeprecationTermsDocumentCommand, CreateTermsDocumentCommand, CreateTermsVersionCommand, DeleteTermsDocumentCommand, DeprecateTermsDocumentCommand, UpdateTermsVersionCommand } from './commands';
import { GetActiveTermsQuery, GetTermsDocumentQuery, GetTermsDocumentsQuery, GetTermsDocumentVersionsQuery } from './queries';
import { TERMS_SERVICE_PATTERNS } from './terms.constants';
import type { AgreeTermsInput,
              CancelDeprecationTermsDocumentInput,
              CreateTermsDocumentInput,
              CreateTermsVersionInput,
              DeleteTermsDocumentInput,
              DeprecateTermsDocumentInput,
              GetActiveTermsInput,
              GetTermsDocumentInput,
              GetTermsDocumentsInput,
              GetTermsDocumentVersionsInput,
              UpdateTermsVersionInput } from './terms.types';

@Controller()
export class TermsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.ACTIVE)
  async getActiveTerms(@Payload() data: GetActiveTermsInput) {
    return this.queryBus.execute(new GetActiveTermsQuery(data.organizationId));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.LIST_DOCUMENTS)
  async getTermsDocuments(@Payload() data: GetTermsDocumentsInput) {
    return this.queryBus.execute(new GetTermsDocumentsQuery(
      data.organizationId,
      data.scope,
      data.status,
      data.keyword,
    ));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.GET_DOCUMENT)
  async getTermsDocument(@Payload() data: GetTermsDocumentInput) {
    return this.queryBus.execute(new GetTermsDocumentQuery(data.id));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.GET_DOCUMENT_VERSIONS)
  async getTermsDocumentVersions(@Payload() data: GetTermsDocumentVersionsInput) {
    return this.queryBus.execute(new GetTermsDocumentVersionsQuery(data.id, data.keyword));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.CREATE_DOCUMENT)
  async createDocument(
    @Payload() data: CreateTermsDocumentInput,
  ) {
    return this.commandBus.execute(new CreateTermsDocumentCommand(
      data.code,
      data.title,
      data.required ?? true,
      data.organizationId ?? undefined,
    ));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.DEPRECATE_DOCUMENT)
  async deprecateDocument(@Payload() data: DeprecateTermsDocumentInput) {
    return this.commandBus.execute(new DeprecateTermsDocumentCommand(
      data.id,
      new Date(data.deprecatedAt),
    ));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.CANCEL_DEPRECATION_DOCUMENT)
  async cancelDeprecationDocument(@Payload() data: CancelDeprecationTermsDocumentInput) {
    return this.commandBus.execute(new CancelDeprecationTermsDocumentCommand(data.id));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.DELETE_DOCUMENT)
  async deleteDocument(@Payload() data: DeleteTermsDocumentInput) {
    return this.commandBus.execute(new DeleteTermsDocumentCommand(data.id));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.CREATE_VERSION)
  async createVersion(
    @Payload() data: CreateTermsVersionInput,
  ) {
    return this.commandBus.execute(new CreateTermsVersionCommand(
      data.termsDocumentId,
      data.label,
      data.content,
      data.effectiveAt ? new Date(data.effectiveAt) : new Date(),
      data.status ?? TermsVersionStatus.DRAFT,
    ));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.UPDATE_VERSION)
  async updateVersion(
    @Payload() data: UpdateTermsVersionInput,
  ) {
    return this.commandBus.execute(new UpdateTermsVersionCommand(
      data.id,
      data.label,
      data.content,
      new Date(data.effectiveAt),
      data.status,
    ));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.AGREE)
  async agreeTerms(@Payload() data: AgreeTermsInput) {
    return this.commandBus.execute(new AgreeTermsCommand(
      data.memberId,
      data.termsVersionId,
      data.organizationId,
    ));
  }
}
