import { Query } from '@nestjs/cqrs';

import type { GetOrganizationListRequestDto } from './get-organization-list.request.dto';
import type { GetOrganizationListResponseDto } from './get-organization-list.response.dto';

export class GetOrganizationListContract extends Query<GetOrganizationListResponseDto> {
  constructor(public readonly data: GetOrganizationListRequestDto) {
    super();
  }
}
