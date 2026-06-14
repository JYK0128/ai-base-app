import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, Organization, OrganizationMetadata } from '@pkg/database';

import { UpdateOrganizationApprovalContract } from './approve-organization.contract';
import { ApproveOrganizationAsserter } from './approve-organization.error';
import { UpdateOrganizationApprovalResponseDto } from './approve-organization.response.dto';

@CommandHandler(UpdateOrganizationApprovalContract)
export class UpdateOrganizationApprovalHandler implements ICommandHandler<UpdateOrganizationApprovalContract> {
  private readonly Asserter = ApproveOrganizationAsserter;

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: CoreRepository<Organization>,
  ) {}

  @Transactional()
  async execute(command: UpdateOrganizationApprovalContract): Promise<UpdateOrganizationApprovalResponseDto> {
    const organization = await this.identifyOrganization(command.data.id);
    await this.validatePolicies(organization);
    this.processApproval(organization, command.data.approve);
    return new UpdateOrganizationApprovalResponseDto(organization.id);
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
