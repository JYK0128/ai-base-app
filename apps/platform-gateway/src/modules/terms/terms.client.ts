import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';

import { CoreClient } from '@/common/clients/core.client';

import { AgreeTermsDto, CancelDeprecationTermsDocumentDto, CreateTermsDocumentDto, CreateTermsVersionDto, DeleteTermsDocumentDto, DeprecateTermsDocumentDto, GetTermsDocumentsQueryDto, UpdateTermsVersionDto } from './dto';
import { TERMS_SERVICE, TERMS_SERVICE_PATTERNS } from './terms.constants';

@Injectable()
export class TermsClient extends CoreClient {
  constructor(
    @Inject(TERMS_SERVICE) client: ClientProxy,
    cls: ClsService,
  ) {
    super(client, cls);
  }

  async getActiveTerms() {
    return this.send(TERMS_SERVICE_PATTERNS.TERM.ACTIVE, {});
  }

  async getTermsDocuments(query: GetTermsDocumentsQueryDto) {
    return this.send(TERMS_SERVICE_PATTERNS.TERM.LIST_DOCUMENTS, query);
  }

  async getTermsDocument(id: string) {
    return this.send(TERMS_SERVICE_PATTERNS.TERM.GET_DOCUMENT, { id });
  }

  async getTermsDocumentVersions(id: string, keyword?: string) {
    return this.send(TERMS_SERVICE_PATTERNS.TERM.GET_DOCUMENT_VERSIONS, { id, keyword });
  }

  async createTermsDocument(data: CreateTermsDocumentDto) {
    return this.send(
      TERMS_SERVICE_PATTERNS.TERM.CREATE_DOCUMENT,
      data.scope === 'platform'
        ? { ...data, organizationId: null }
        : data,
    );
  }

  async deprecateTermsDocument(data: DeprecateTermsDocumentDto) {
    return this.send(TERMS_SERVICE_PATTERNS.TERM.DEPRECATE_DOCUMENT, data);
  }

  async cancelDeprecationTermsDocument(data: CancelDeprecationTermsDocumentDto) {
    return this.send(TERMS_SERVICE_PATTERNS.TERM.CANCEL_DEPRECATION_DOCUMENT, data);
  }

  async deleteTermsDocument(data: DeleteTermsDocumentDto) {
    return this.send(TERMS_SERVICE_PATTERNS.TERM.DELETE_DOCUMENT, data);
  }

  async createTermsVersion(data: CreateTermsVersionDto) {
    return this.send(TERMS_SERVICE_PATTERNS.TERM.CREATE_VERSION, data);
  }

  async updateTermsVersion(data: UpdateTermsVersionDto) {
    return this.send(TERMS_SERVICE_PATTERNS.TERM.UPDATE_VERSION, data);
  }

  async agreeTerms(data: AgreeTermsDto) {
    return this.send(TERMS_SERVICE_PATTERNS.TERM.AGREE, data);
  }
}
