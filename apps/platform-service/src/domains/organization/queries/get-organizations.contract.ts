import { Query } from '@nestjs/cqrs';

import type { GetOrganizationsRequestDto } from './get-organizations.request.dto';
import type { GetOrganizationsResponseDto } from './get-organizations.response.dto';

export class GetOrganizationsContract extends Query<GetOrganizationsResponseDto> {
  constructor(public readonly data: GetOrganizationsRequestDto) {
    super();
  }
}
