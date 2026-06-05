import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TermsVersionStatus } from '@pkg/database';

import { AgreeTermsCommand, CancelDeprecationTermsDocumentCommand, CreateTermsDocumentCommand, CreateTermsVersionCommand, DeleteTermsDocumentCommand, DeprecateTermsDocumentCommand, UpdateTermsVersionCommand } from './commands';
import { GetActiveTermsQuery, GetTermsDocumentQuery, GetTermsDocumentsQuery, GetTermsDocumentVersionsQuery } from './queries';
import { TERMS_SERVICE_PATTERNS } from './terms.constants';

@Controller()
export class TermsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.ACTIVE)
  async getActiveTerms(@Payload() data: { organizationId?: string }) {
    return this.queryBus.execute(new GetActiveTermsQuery(data.organizationId));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.LIST_DOCUMENTS)
  async getTermsDocuments(@Payload() data: { organizationId?: string, scope?: 'platform' | 'organization', status?: string, keyword?: string }) {
    return this.queryBus.execute(new GetTermsDocumentsQuery(
      data.organizationId,
      data.scope,
      data.status,
      data.keyword,
    ));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.GET_DOCUMENT)
  async getTermsDocument(@Payload() data: { id: string }) {
    return this.queryBus.execute(new GetTermsDocumentQuery(data.id));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.GET_DOCUMENT_VERSIONS)
  async getTermsDocumentVersions(@Payload() data: { id: string, keyword?: string }) {
    return this.queryBus.execute(new GetTermsDocumentVersionsQuery(data.id, data.keyword));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.CREATE_DOCUMENT)
  async createDocument(@Payload() data: { code: string, title: string, required?: boolean, organizationId?: string | null }) {
    return this.commandBus.execute(new CreateTermsDocumentCommand(
      data.code,
      data.title,
      data.required ?? true,
      data.organizationId ?? undefined,
    ));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.DEPRECATE_DOCUMENT)
  async deprecateDocument(@Payload() data: { id: string, deprecatedAt: string | Date }) {
    return this.commandBus.execute(new DeprecateTermsDocumentCommand(
      data.id,
      new Date(data.deprecatedAt),
    ));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.CANCEL_DEPRECATION_DOCUMENT)
  async cancelDeprecationDocument(@Payload() data: { id: string }) {
    return this.commandBus.execute(new CancelDeprecationTermsDocumentCommand(data.id));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.DELETE_DOCUMENT)
  async deleteDocument(@Payload() data: { id: string }) {
    return this.commandBus.execute(new DeleteTermsDocumentCommand(data.id));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.CREATE_VERSION)
  async createVersion(@Payload() data: {
    termsDocumentId: string
    label: string
    content: string
    effectiveAt?: Date | string
    status?: TermsVersionStatus
  }) {
    return this.commandBus.execute(new CreateTermsVersionCommand(
      data.termsDocumentId,
      data.label,
      data.content,
      data.effectiveAt ? new Date(data.effectiveAt) : new Date(),
      data.status ?? TermsVersionStatus.DRAFT,
    ));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.UPDATE_VERSION)
  async updateVersion(@Payload() data: {
    id: string
    label: string
    content: string
    effectiveAt: Date | string
    status: TermsVersionStatus
  }) {
    return this.commandBus.execute(new UpdateTermsVersionCommand(
      data.id,
      data.label,
      data.content,
      new Date(data.effectiveAt),
      data.status,
    ));
  }

  @MessagePattern(TERMS_SERVICE_PATTERNS.TERM.AGREE)
  async agreeTerms(@Payload() data: { memberId: string, termsVersionId: string, organizationId?: string }) {
    return this.commandBus.execute(new AgreeTermsCommand(
      data.memberId,
      data.termsVersionId,
      data.organizationId,
    ));
  }
}
