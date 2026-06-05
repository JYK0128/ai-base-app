import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';
import { defaultIfEmpty, firstValueFrom } from 'rxjs';

export abstract class CoreClient {
  protected constructor(
    protected readonly client: ClientProxy,
    protected readonly cls: ClsService,
  ) {}

  protected send<TResult = unknown, TInput extends object = object>(pattern: string, data: TInput): Promise<TResult> {
    const store = this.cls.isActive() ? this.cls.get() : undefined;
    const payload = { ...data, ...store };

    return firstValueFrom(
      this.client.send<TResult>(pattern, payload).pipe(
        defaultIfEmpty(undefined as TResult),
      ),
    );
  }
}
