import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';
import { defaultIfEmpty, firstValueFrom } from 'rxjs';

import { CORE_SERVICE, CORE_SERVICE_PATTERNS } from './core.constants';
import { AgreeTermsDto, CreateAnnouncementDto, CreateTermsDocumentDto, CreateTermsVersionDto } from './dto/core-request.dto';

@Injectable()
export class CoreClient {
  constructor(
    @Inject(CORE_SERVICE)
    private readonly client: ClientProxy,
    private readonly cls: ClsService,
  ) {}

  /**
   * 코어 마이크로서비스로 요청을 보낼 때 공통 메타데이터(traceId 등)를 주입합니다.
   */
  private async send<TResult = unknown, TInput extends object = object>(pattern: string, data: TInput): Promise<TResult> {
    const payload = {
      ...data,
      traceId: this.cls.get('traceId'),
      sid: this.cls.get('sid'),
      clientIp: this.cls.get('clientIp'),
      id: this.cls.get('id'),
      organizationId: this.cls.get('organizationId'),
    };

    return firstValueFrom(
      this.client.send<TResult>(pattern, payload).pipe(
        defaultIfEmpty(undefined as TResult),
      ),
    );
  }

  // --- Organizations ---
  async getOrganizations(query: { status?: string }) {
    return this.send(CORE_SERVICE_PATTERNS.ORGANIZATIONS.GET, query);
  }

  async approveOrganization(id: string, approve: boolean) {
    return this.send(CORE_SERVICE_PATTERNS.ORGANIZATIONS.APPROVE, { id, approve });
  }

  // --- Announcements ---
  async getAnnouncements(query: { isPublishedOnly?: boolean }) {
    return this.send(CORE_SERVICE_PATTERNS.ANNOUNCEMENTS.GET, query);
  }

  async createAnnouncement(authorId: string, data: CreateAnnouncementDto) {
    return this.send(CORE_SERVICE_PATTERNS.ANNOUNCEMENTS.CREATE, { authorId, data });
  }

  // --- Support ---
  async getTickets(query: { organizationId?: string, status?: string }) {
    return this.send(CORE_SERVICE_PATTERNS.SUPPORT.TICKETS_GET, query);
  }

  // --- Terms ---
  async getActiveTerms(organizationId?: string) {
    return this.send(CORE_SERVICE_PATTERNS.TERMS.GET_ACTIVE, { organizationId });
  }

  async createTermsDocument(data: CreateTermsDocumentDto) {
    return this.send(CORE_SERVICE_PATTERNS.TERMS.CREATE_DOCUMENT, data);
  }

  async createTermsVersion(data: CreateTermsVersionDto) {
    return this.send(CORE_SERVICE_PATTERNS.TERMS.CREATE_VERSION, data);
  }

  async agreeTerms(data: AgreeTermsDto) {
    return this.send(CORE_SERVICE_PATTERNS.TERMS.AGREE, data);
  }
}
