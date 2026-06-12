import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, TermsDocument, TermsDocumentStatus } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { getCurrentPublishedVersion, mapTermsDocumentResponse } from '../terms.helper';
import { GetActiveTermsContract } from './get-active-terms.contract';
import { TermsDocumentResponseDto } from './get-active-terms.response.dto';

@QueryHandler(GetActiveTermsContract)
export class GetActiveTermsHandler implements IQueryHandler<GetActiveTermsContract> {
  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: CoreRepository<TermsDocument>,
    private readonly cls: ClsService,
  ) {}

  async execute(): Promise<TermsDocumentResponseDto[]> {
    const organizationId = this.cls.get('organizationId');
    const documents = await this.termsDocumentRepo.find(
      {
        status: TermsDocumentStatus.PUBLISHED,
        ...(organizationId
          ? {
            $or: [
              { organization: null },
              { organization: organizationId },
            ],
          }
          : {
            organization: null,
          }),
      },
      {
        populate: ['organization', 'versions'],
        orderBy: { createdAt: 'DESC' },
      },
    );

    return documents
      .filter((document) => !!getCurrentPublishedVersion(document.versions.getItems()))
      .filter((document) => !document.isDeprecated)
      .map((document) => mapTermsDocumentResponse(document));
  }
}
