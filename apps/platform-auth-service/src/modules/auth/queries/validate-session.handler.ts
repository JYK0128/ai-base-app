import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { RedisService } from '@/modules/redis/redis.service';

export class ValidateSessionQuery {
  constructor(
    public readonly id: string,
    public readonly sid: string,
  ) {}
}

@QueryHandler(ValidateSessionQuery)
export class ValidateSessionHandler implements IQueryHandler<ValidateSessionQuery> {
  private readonly logger = new Logger(ValidateSessionHandler.name);

  constructor(private readonly redisService: RedisService) {}

  async execute(query: ValidateSessionQuery): Promise<boolean> {
    const { id, sid } = query;

    const activeSid = await this.redisService.get(`active_session:${id}`);

    if (!activeSid || activeSid !== sid) {
      this.logger.warn(`Invalid session detected for user ${id}. Expected: ${activeSid}, Received: ${sid}`);
      return false;
    }

    return true;
  }
}
