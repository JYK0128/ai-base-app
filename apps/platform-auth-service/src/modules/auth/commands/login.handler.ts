import { Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

export class LoginCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly clientIp: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  private readonly logger = new Logger(LoginHandler.name);

  constructor(private readonly eventBus: EventBus) {}

  async execute(command: LoginCommand) {
    const { email, password, clientIp } = command;
    this.logger.log(`Executing LoginCommand for user: ${email}`);

    // 비즈니스 로직 (예: 마지막 로그인 시간 업데이트 등)
    // ...

    return { success: true, email };
  }
}
