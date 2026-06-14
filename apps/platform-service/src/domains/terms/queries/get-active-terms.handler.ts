import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, TermsDocument, TermsVersion } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { GetActiveTermsContract } from './get-active-terms.contract';
import { GetTermsDocumentResponseDto } from './get-active-terms.response.dto';

const getCurrentPublishedVersion = (versions: TermsVersion[]) => (
  [...versions]
    .filter((version) => version.isCurrentlyEffective)
    .sort((left, right) => (right.effectiveAt?.getTime() ?? 0) - (left.effectiveAt?.getTime() ?? 0))[0]
);

@QueryHandler(GetActiveTermsContract)
export class GetActiveTermsHandler implements IQueryHandler<GetActiveTermsContract> {
  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: CoreRepository<TermsDocument>,
    private readonly cls: ClsService,
  ) {}

  async execute(): Promise<GetTermsDocumentResponseDto[]> {
    const organizationId = this.cls.get('organizationId');
    const documents = await this.termsDocumentRepo.find(
      {
        metadata: { publishedAt: { $ne: null } },
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
      .filter((document) => !document.isTerminated)
      .map((document) => new GetTermsDocumentResponseDto(document));
  }
}
