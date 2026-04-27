import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { RedisService } from '@/modules/redis/redis.service';

export class LogoutCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly redisService: RedisService,
  ) {}

  async execute(command: LogoutCommand) {
    const { id } = command;
    await Promise.all([
      this.redisService.del(`refresh:${id}`),
    ]);

    return { success: true };
  }
}
