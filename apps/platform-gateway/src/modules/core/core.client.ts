import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { CORE_SERVICE } from './core.constants';

@Injectable()
export class CoreClient {
  constructor(
    @Inject(CORE_SERVICE)
    private readonly client: ClientProxy,
  ) {}

  async send<T, TPayload = unknown>(pattern: string, data: TPayload): Promise<T> {
    return firstValueFrom(this.client.send<T>(pattern, data));
  }
}
