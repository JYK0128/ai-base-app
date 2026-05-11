import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Organization, OrganizationRepository, OrganizationStatus } from '@pkg/database';

export { ApproveOrganizationCommand } from './approve-organization.helpers';
import { ApproveOrganizationAsserter, ApproveOrganizationCommand } from './approve-organization.helpers';

@CommandHandler(ApproveOrganizationCommand)
export class ApproveOrganizationHandler implements ICommandHandler<ApproveOrganizationCommand> {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: OrganizationRepository,
  ) {}

  @Transactional()
  async execute(command: ApproveOrganizationCommand): Promise<void> {
    const organization = await ApproveOrganizationAsserter.assert(
      await this.organizationRepo.findOne(command.organizationId),
      'ORGANIZATION_NOT_FOUND',
    );

    organization.status = command.approve
      ? OrganizationStatus.ACTIVE
      : OrganizationStatus.REJECTED;

    // flush is handled by Transactional
  }
}
