import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { RedisService } from '../../redis/redis.service';

export class LogoutCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  private readonly logger = new Logger(LogoutHandler.name);

  constructor(
    private readonly redisService: RedisService,
  ) {}

  async execute(command: LogoutCommand) {
    const { userId } = command;
    this.logger.log(`Executing LogoutCommand for user: ${userId}`);

    await this.redisService.del(`refresh:${userId}`);

    return { success: true };
  }
}
