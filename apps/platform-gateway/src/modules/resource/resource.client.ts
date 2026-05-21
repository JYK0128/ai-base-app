import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';
import { defaultIfEmpty, firstValueFrom } from 'rxjs';

import { CORE_SERVICE } from '../core/core.constants';

@Injectable()
export class ResourceClient {
  constructor(
    @Inject(CORE_SERVICE)
    private readonly client: ClientProxy,
    private readonly cls: ClsService,
  ) {}

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

  async getResources() {
    return this.send('resources.get', {});
  }

  async getMyResources(permissions: string[], roles: string[]) {
    return this.send('resources.get', { permissions, roles });
  }

  async createResources(items: Array<{
    operation: 'CREATE' | 'UPDATE' | 'DELETE'
    tempId?: string
    id?: string
    code?: string
    name?: string
    type?: string
    path?: string
    icon?: string
    parentId?: string
    parentTempId?: string
    sortOrder?: number
    actions?: string[]
    translations?: Record<string, string>
  }>) {
    return this.send<{ results: Array<{ operation: 'CREATE' | 'UPDATE' | 'DELETE', tempId?: string, id: string }> }>('resources.create-batch', { items });
  }
}
