import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';
import { defaultIfEmpty, firstValueFrom } from 'rxjs';

import { RESOURCE_SERVICE, RESOURCE_SERVICE_PATTERNS } from './resource.constants';

@Injectable()
export class ResourceClient {
  constructor(
    @Inject(RESOURCE_SERVICE)
    private readonly client: ClientProxy,
    private readonly cls: ClsService,
  ) {}

  private async send<TResult = unknown, TInput extends object = object>(pattern: string, data: TInput): Promise<TResult> {
    const payload = {
      ...data,
      traceId: this.cls.get('traceId'),
      sid: this.cls.get('sid'),
      clientIp: this.cls.get('clientIp'),
      userId: this.cls.get('userId'),
      organizationId: this.cls.get('organizationId'),
    };

    return firstValueFrom(
      this.client.send<TResult>(pattern, payload).pipe(
        defaultIfEmpty(undefined as TResult),
      ),
    );
  }

  async getResources() {
    return this.send(RESOURCE_SERVICE_PATTERNS.RESOURCE.LIST, {});
  }

  async getResource(id: string) {
    return this.send(RESOURCE_SERVICE_PATTERNS.RESOURCE.GET, { id });
  }

  async getMyResources(permissions: string[], roles: string[]) {
    return this.send(RESOURCE_SERVICE_PATTERNS.RESOURCE.LIST, { permissions, roles });
  }

  async createResource(data: {
    code: string
    name: string
    type: string
    path?: string
    icon?: string
    parentId?: string
    sortOrder?: number
  }) {
    return this.send<{ id: string }>(RESOURCE_SERVICE_PATTERNS.RESOURCE.CREATE, data);
  }

  async updateResourceDetail(data: {
    id: string
    code: string
    name: string
    path?: string
    icon?: string
  }) {
    return this.send<{ id: string }>(RESOURCE_SERVICE_PATTERNS.RESOURCE.UPDATE_DETAIL, data);
  }

  async deleteResource(id: string) {
    return this.send<{ id: string }>(RESOURCE_SERVICE_PATTERNS.RESOURCE.DELETE, { id });
  }

  async updateResourcePermissions(data: {
    id: string
    actions: string[]
    constraint?: string
  }) {
    return this.send<{ id: string }>(RESOURCE_SERVICE_PATTERNS.RESOURCE.UPDATE_PERMISSIONS, data);
  }

  async updateResourceSort(data: {
    id: string
    sortOrder: number
  }) {
    return this.send<{ id: string }>(RESOURCE_SERVICE_PATTERNS.RESOURCE.UPDATE_SORT, data);
  }
}
