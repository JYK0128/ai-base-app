import { Command } from '@nestjs/cqrs';

import type { UpdateOrganizationRequestDto } from './update-organization.request.dto';
import type { UpdateOrganizationResponseDto } from './update-organization.response.dto';

export class UpdateOrganizationContract extends Command<UpdateOrganizationResponseDto> {
  constructor(public readonly data: UpdateOrganizationRequestDto) {
    super();
  }
}
