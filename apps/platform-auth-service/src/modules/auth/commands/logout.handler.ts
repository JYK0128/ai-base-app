import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Redis } from 'ioredis';

export class LogoutCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  private readonly logger = new Logger(LogoutHandler.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async execute(command: LogoutCommand) {
    const { userId } = command;
    this.logger.log(`Executing LogoutCommand for user: ${userId}`);

    // Redis에서 Refresh Token 삭제
    await this.redis.del(`auth:refresh:${userId}`);

    return { success: true };
  }
}
