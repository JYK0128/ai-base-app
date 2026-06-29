import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Organization, OrganizationMetadata } from '@pkg/database';

import { ApproveOrganizationContract } from './approve-organization.contract';
import { ApproveOrganizationAsserter } from './approve-organization.error';
import { ApproveOrganizationResponseDto } from './approve-organization.response.dto';

@CommandHandler(ApproveOrganizationContract)
export class ApproveOrganizationHandler implements ICommandHandler<ApproveOrganizationContract> {
  private readonly Asserter = ApproveOrganizationAsserter;

  constructor(
  ) {}

  @Transactional()
  async execute(command: ApproveOrganizationContract): Promise<ApproveOrganizationResponseDto> {
    const organizationId = command.data.id;
    if (!organizationId) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    const organization = await this.identifyOrganization(organizationId);
    await this.verifyPolicies(organization);
    this.processApprove(command, organization);
    return new ApproveOrganizationResponseDto(organization.id);
  }

  private async identifyOrganization(organizationId: string): Promise<Organization> {
    return await this.Asserter.assert(
      Organization.findOne(organizationId),
      'ORGANIZATION_NOT_FOUND',
    );
  }

  private async verifyPolicies(_organization: Organization): Promise<void> {
    // 정책 유효성 검증 영역
  }

  private processApprove(command: ApproveOrganizationContract, organization: Organization) {
    const { approve } = command.data;
    const metadata = organization.metadata ?? new OrganizationMetadata();

    organization.metadata = new OrganizationMetadata({
      ...metadata,
      approvedAt: approve ? new Date() : null,
      deactivatedAt: null,
      rejectedAt: approve ? null : new Date(),
    });
  }
}
