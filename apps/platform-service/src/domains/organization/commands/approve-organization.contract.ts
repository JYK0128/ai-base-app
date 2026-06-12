import { Command } from '@nestjs/cqrs';

import type { ApproveOrganizationRequestDto } from './approve-organization.request.dto';
import type { ApproveOrganizationResponseDto } from './approve-organization.response.dto';

export class ApproveOrganizationContract extends Command<ApproveOrganizationResponseDto> {
  constructor(public readonly data: Pick<ApproveOrganizationRequestDto, 'approve'> & { id: string }) {
    super();
  }
}
