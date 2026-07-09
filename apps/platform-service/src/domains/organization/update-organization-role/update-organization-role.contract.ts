import { Command } from '@nestjs/cqrs';

import type { UpdateOrganizationRoleRequestDto } from './update-organization-role.request.dto';
import type { UpdateOrganizationRoleResponseDto } from './update-organization-role.response.dto';

export class UpdateOrganizationRoleContract extends Command<UpdateOrganizationRoleResponseDto> {
  constructor(public readonly data: UpdateOrganizationRoleRequestDto) {
    super();
  }
}
