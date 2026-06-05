import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';

import { CoreClient } from '@/common/clients/core.client';

import { GetTicketsQueryDto } from './dto';
import { SUPPORT_SERVICE, SUPPORT_SERVICE_PATTERNS } from './support.constants';

@Injectable()
export class SupportClient extends CoreClient {
  constructor(
    @Inject(SUPPORT_SERVICE) client: ClientProxy,
    cls: ClsService,
  ) {
    super(client, cls);
  }

  async getTickets(query: GetTicketsQueryDto) {
    return this.send(SUPPORT_SERVICE_PATTERNS.SUPPORT.TICKET_LIST, query);
  }
}
