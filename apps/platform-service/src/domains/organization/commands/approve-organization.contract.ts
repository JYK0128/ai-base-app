import { Command } from '@nestjs/cqrs';

import type { UpdateOrganizationApprovalRequestDto } from './approve-organization.request.dto';
import type { UpdateOrganizationApprovalResponseDto } from './approve-organization.response.dto';

export class UpdateOrganizationApprovalContract extends Command<UpdateOrganizationApprovalResponseDto> {
  constructor(public readonly data: UpdateOrganizationApprovalRequestDto) {
    super();
  }
}
