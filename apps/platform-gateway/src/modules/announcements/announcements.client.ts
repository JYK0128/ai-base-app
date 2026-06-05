import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';

import { CoreClient } from '@/common/clients/core.client';

import { ANNOUNCEMENTS_SERVICE, ANNOUNCEMENTS_SERVICE_PATTERNS } from './announcements.constants';
import { CreateAnnouncementDto, GetAnnouncementsQueryDto } from './dto';

@Injectable()
export class AnnouncementsClient extends CoreClient {
  constructor(
    @Inject(ANNOUNCEMENTS_SERVICE) client: ClientProxy,
    cls: ClsService,
  ) {
    super(client, cls);
  }

  async getAnnouncements(query: GetAnnouncementsQueryDto) {
    return this.send(ANNOUNCEMENTS_SERVICE_PATTERNS.ANNOUNCEMENT.LIST, query);
  }

  async createAnnouncement(memberId: string, data: CreateAnnouncementDto) {
    return this.send(ANNOUNCEMENTS_SERVICE_PATTERNS.ANNOUNCEMENT.CREATE, { memberId, data });
  }
}
