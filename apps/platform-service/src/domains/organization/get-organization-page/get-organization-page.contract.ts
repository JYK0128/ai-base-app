import { Query } from '@nestjs/cqrs';

import type { GetOrganizationPageRequestDto } from './get-organization-page.request.dto';
import type { GetOrganizationPageResponseDto } from './get-organization-page.response.dto';

export class GetOrganizationPageContract extends Query<GetOrganizationPageResponseDto> {
  constructor(public readonly data: GetOrganizationPageRequestDto) {
    super();
  }
}
