import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, Organization, OrganizationMetadata } from '@pkg/database';

import { ApproveOrganizationContract } from './approve-organization.contract';
import { ApproveOrganizationAsserter } from './approve-organization.error';
import { ApproveOrganizationResponseDto } from './approve-organization.response.dto';

@CommandHandler(ApproveOrganizationContract)
export class ApproveOrganizationHandler implements ICommandHandler<ApproveOrganizationContract> {
  private readonly Asserter = ApproveOrganizationAsserter;

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: CoreRepository<Organization>,
  ) {}

  @Transactional()
  async execute(command: ApproveOrganizationContract): Promise<ApproveOrganizationResponseDto> {
    const organizationId = command.data.id;
    if (!organizationId) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    const organization = await this.identifyOrganization(organizationId);
    await this.validatePolicies(organization);
    this.processApproval(organization, command.data.approve);
    return new ApproveOrganizationResponseDto(organization.id);
  }

  private async identifyOrganization(organizationId: string): Promise<Organization> {
    return await this.Asserter.assert(
      this.organizationRepository.findOne(organizationId),
      'ORGANIZATION_NOT_FOUND',
    );
  }

  private async validatePolicies(_organization: Organization): Promise<void> {
    // 정책 유효성 검증 영역
  }

  private processApproval(organization: Organization, approve: boolean) {
    const metadata = organization.metadata ?? new OrganizationMetadata();

    organization.metadata = new OrganizationMetadata({
      ...metadata,
      approvedAt: approve ? new Date() : null,
      deactivatedAt: null,
      rejectedAt: approve ? null : new Date(),
    });
  }
}
