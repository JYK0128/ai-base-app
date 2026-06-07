import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { ApproveOrganizationCommand } from './commands';
import { ORGANIZATION_SERVICE_PATTERNS } from './organization.contract';
import type { ApproveOrganizationInput, GetOrganizationsInput } from './organization.types';
import { GetOrganizationsQuery } from './queries';

@Controller()
export class OrganizationController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern(ORGANIZATION_SERVICE_PATTERNS.ORGANIZATION.LIST)
  async getOrganizations(@Payload() data: GetOrganizationsInput) {
    return this.queryBus.execute(new GetOrganizationsQuery(data.status));
  }

  @MessagePattern(ORGANIZATION_SERVICE_PATTERNS.ORGANIZATION.APPROVE)
  async approveOrganization(@Payload() data: ApproveOrganizationInput) {
    return this.commandBus.execute(new ApproveOrganizationCommand(data.id, data.approve));
  }
}
