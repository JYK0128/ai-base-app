/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { createHash } from 'node:crypto';

import { InjectRepository } from '@mikro-orm/nestjs';
import type { EntityRepository } from '@mikro-orm/postgresql';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ManagerAccount } from '@pkg/database/src/domains/manager/manager.account.entity';
import { UserAccount } from '@pkg/database/src/domains/site/user.account.entity';

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

  constructor(
    @InjectRepository(ManagerAccount)
    private readonly managerAccountRepository: EntityRepository<ManagerAccount>,
    @InjectRepository(UserAccount)
    private readonly userAccountRepository: EntityRepository<UserAccount>,
  ) {}

  async execute(command: LoginCommand) {
    const { email, password, clientIp } = command;
    this.logger.log(`Executing LoginCommand for user: ${email}`);

    const managerAccount = await this.managerAccountRepository.findOne({ email });
    if (managerAccount) {
      return this.buildLoginResponse({
        id: managerAccount.id,
        email: managerAccount.email,
        password: managerAccount.password,
        accountType: 'manager',
      }, password, clientIp);
    }

    const userAccount = await this.userAccountRepository.findOne({ email });
    if (userAccount) {
      return this.buildLoginResponse({
        id: userAccount.id,
        email: userAccount.email,
        password: userAccount.password,
        accountType: 'user',
      }, password, clientIp);
    }

    throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다.');
  }

  private buildLoginResponse(
    account: { id: string, email: string, password: string, accountType: 'manager' | 'user' },
    password: string,
    clientIp: string,
  ) {
    if (account.password !== password) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    const accessToken = createHash('sha256')
      .update(`${account.id}:${account.email}:${Date.now()}`)
      .digest('hex');

    return {
      success: true,
      userId: account.id,
      email: account.email,
      accountType: account.accountType,
      clientIp,
      accessToken,
    };
  }
}
