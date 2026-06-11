import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, TermsDocumentStatus, TermsVersion } from '@pkg/database';

import { mapTermsVersionResponse, type TermsVersionResponse } from '../terms.helper';
import { UpdateTermsVersionCommand } from './update-terms-version.command';
import { UpdateTermsVersionAsserter } from './update-terms-version.error';

/**
 * 약관 버전 수정 핸들러
 */
@CommandHandler(UpdateTermsVersionCommand)
export class UpdateTermsVersionHandler implements ICommandHandler<UpdateTermsVersionCommand> {
  private readonly Asserter = UpdateTermsVersionAsserter;

  constructor(
    @InjectRepository(TermsVersion)
    private readonly termsVersionRepo: CoreRepository<TermsVersion>,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: UpdateTermsVersionCommand): Promise<TermsVersionResponse> {
    const termsVersion = await this.identifyVersion(command.id);
    await this.validateVersionState(termsVersion);
    await this.validatePolicies(termsVersion, command.label);
    return this.processUpdate(termsVersion, command);
  }

  /**
   * STEP 1: 약관 버전 식별
   */
  private async identifyVersion(id: string): Promise<TermsVersion> {
    const termsVersion = await this.termsVersionRepo.findOne(
      { id },
      { populate: ['termsDocument', 'termsDocument.organization'] },
    );

    return this.Asserter.assert(termsVersion, 'VERSION_NOT_FOUND');
  }

  /**
   * STEP 2: 수정 가능 여부 검증
   */
  private async validateVersionState(termsVersion: TermsVersion) {
    await this.Asserter.throwIf(termsVersion.termsDocument.isDeprecated, 'DOCUMENT_DEPRECATED');

    const canEdit = termsVersion.isDraft || termsVersion.isScheduledForActivation;

    await this.Asserter.throwIf(!canEdit, 'VERSION_NOT_EDITABLE');
  }

  /**
   * STEP 3: 정책 검증
   */
  private async validatePolicies(termsVersion: TermsVersion, label: string) {
    const alreadyExists = await this.termsVersionRepo.findOne({
      termsDocument: termsVersion.termsDocument.id,
      label,
      id: { $ne: termsVersion.id },
    });

    await this.Asserter.throwIf(!!alreadyExists, 'VERSION_ALREADY_EXISTS');
  }

  /**
   * STEP 4: 약관 버전 수정
   */
  private processUpdate(
    termsVersion: TermsVersion,
    command: UpdateTermsVersionCommand,
  ): TermsVersionResponse {
    termsVersion.label = command.label;
    termsVersion.content = command.content;
    termsVersion.effectiveAt = command.effectiveAt;
    termsVersion.status = command.status;

    if (termsVersion.isPublished) {
      const document = termsVersion.termsDocument;
      document.status = TermsDocumentStatus.PUBLISHED;
      document.latestVersion = termsVersion;
    }

    this.em.persist(termsVersion);
    return mapTermsVersionResponse(termsVersion);
  }
}
