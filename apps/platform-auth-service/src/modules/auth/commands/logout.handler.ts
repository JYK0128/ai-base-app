import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { RedisService } from '@/modules/redis/redis.service';

import { LogoutCommand } from './logout.command';
import { LogoutAsserter } from './logout.error';

/**
 * 로그아웃 처리 핸들러
 */
@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  private readonly Asserter = LogoutAsserter;

  constructor(private readonly redisService: RedisService) {}

  async execute(command: LogoutCommand) {
    const { accountId } = command;

    // 세션 삭제
    await this.redisService.del(`refresh:${accountId}`);

    return { success: true };
  }
}
