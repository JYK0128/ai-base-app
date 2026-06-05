import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';

import { CoreClient } from '@/common/clients/core.client';

import { GetOrganizationsQueryDto } from './dto';
import { ORGANIZATIONS_SERVICE, ORGANIZATIONS_SERVICE_PATTERNS } from './organizations.constants';

@Injectable()
export class OrganizationsClient extends CoreClient {
  constructor(
    @Inject(ORGANIZATIONS_SERVICE) client: ClientProxy,
    cls: ClsService,
  ) {
    super(client, cls);
  }

  async getOrganizations(query: GetOrganizationsQueryDto) {
    return this.send(ORGANIZATIONS_SERVICE_PATTERNS.ORGANIZATION.LIST, query);
  }

  async approveOrganization(id: string, approve: boolean) {
    return this.send(ORGANIZATIONS_SERVICE_PATTERNS.ORGANIZATION.APPROVE, { id, approve });
  }
}
