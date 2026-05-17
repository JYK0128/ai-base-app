import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { RedisService } from '@/modules/redis/redis.service';

import { LogoutAsserter, LogoutCommand } from './logout.helpers';

/**
 * 로그아웃 처리 핸들러
 */
@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  private readonly Asserter = LogoutAsserter;

  constructor(private readonly redisService: RedisService) {}

  async execute(command: LogoutCommand) {
    const { id } = command;

    // 세션 삭제
    await this.redisService.del(`refresh:${id}`);

    return { success: true };
  }
}
