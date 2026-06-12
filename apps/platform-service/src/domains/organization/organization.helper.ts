import type { Organization } from '@pkg/database';

import { OrganizationResponseDto } from './queries/get-organizations.response.dto';

export function buildOrganizationResponse(organization: Organization): OrganizationResponseDto {
  return new OrganizationResponseDto(organization);
}
