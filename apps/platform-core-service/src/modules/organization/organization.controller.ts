import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrganizationStatus } from '@pkg/database';

import { ApproveOrganizationCommand } from './commands/approve-organization.handler';
import { GetOrganizationsQuery } from './queries/get-organizations.handler';

@Controller()
export class OrganizationController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern('organizations.get')
  async getOrganizations(@Payload() data: { status?: OrganizationStatus }) {
    return this.queryBus.execute(new GetOrganizationsQuery(data.status));
  }

  @MessagePattern('organizations.approve')
  async approveOrganization(@Payload() data: { id: string, approve: boolean }) {
    return this.commandBus.execute(new ApproveOrganizationCommand(data.id, data.approve));
  }
}
