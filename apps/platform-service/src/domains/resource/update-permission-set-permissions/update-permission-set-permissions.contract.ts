import { Command } from '@nestjs/cqrs';

import type { UpdatePermissionSetPermissionsRequestDto } from './update-permission-set-permissions.request.dto';
import type { UpdatePermissionSetPermissionsResponseDto } from './update-permission-set-permissions.response.dto';

export class UpdatePermissionSetPermissionsContract extends Command<UpdatePermissionSetPermissionsResponseDto> {
  constructor(public readonly data: UpdatePermissionSetPermissionsRequestDto) {
    super();
  }
}
