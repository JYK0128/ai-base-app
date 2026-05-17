import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Organization, OrganizationRepository, OrganizationStatus } from '@pkg/database';

import { ApproveOrganizationAsserter, ApproveOrganizationCommand } from './approve-organization.helpers';

/**
 * 조직 승인 핸들러
 */
@CommandHandler(ApproveOrganizationCommand)
export class ApproveOrganizationHandler implements ICommandHandler<ApproveOrganizationCommand> {
  private readonly Asserter = ApproveOrganizationAsserter;

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: OrganizationRepository,
  ) {}

  @Transactional()
  async execute(command: ApproveOrganizationCommand): Promise<void> {
    const { organizationId, approve } = command;

    const organization = await this.identifyOrganization(organizationId);

    this.processApproval(organization, approve);
  }

  /**
   * STEP 1: 조직 식별
   */
  private async identifyOrganization(organizationId: string): Promise<Organization> {
    return await this.Asserter.assert(
      this.organizationRepo.findOne(organizationId),
      'ORGANIZATION_NOT_FOUND',
    );
  }

  /**
   * STEP 2: 승인 상태 업데이트
   */
  private processApproval(organization: Organization, approve: boolean) {
    organization.status = approve
      ? OrganizationStatus.ACTIVE
      : OrganizationStatus.REJECTED;
  }
}
