import { Command } from '@nestjs/cqrs';

import type { CreateOrganizationRoleRequestDto } from './create-organization-role.request.dto';
import type { CreateOrganizationRoleResponseDto } from './create-organization-role.response.dto';

export class CreateOrganizationRoleContract extends Command<CreateOrganizationRoleResponseDto> {
  constructor(public readonly data: CreateOrganizationRoleRequestDto) {
    super();
  }
}
