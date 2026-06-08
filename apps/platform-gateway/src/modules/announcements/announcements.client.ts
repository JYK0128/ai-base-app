import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';

import { CoreClient } from '@/common/clients/core.client';

import { ANNOUNCEMENTS_SERVICE_PATTERNS } from './announcements.contract';
import { ANNOUNCEMENTS_SERVICE } from './announcements.tokens';
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

  async createAnnouncement(data: CreateAnnouncementDto) {
    return this.send(ANNOUNCEMENTS_SERVICE_PATTERNS.ANNOUNCEMENT.CREATE, { data });
  }

  async updateAnnouncement(id: string, data: CreateAnnouncementDto) {
    return this.send(ANNOUNCEMENTS_SERVICE_PATTERNS.ANNOUNCEMENT.UPDATE, { announcementId: id, data });
  }

  async deleteAnnouncement(id: string) {
    return this.send(ANNOUNCEMENTS_SERVICE_PATTERNS.ANNOUNCEMENT.DELETE, { announcementId: id });
  }
}
