import { Command } from '@nestjs/cqrs';

import type { DeleteOrganizationRoleRequestDto } from './delete-organization-role.request.dto';
import type { DeleteOrganizationRoleResponseDto } from './delete-organization-role.response.dto';

export class DeleteOrganizationRoleContract extends Command<DeleteOrganizationRoleResponseDto> {
  constructor(public readonly data: DeleteOrganizationRoleRequestDto) {
    super();
  }
}
