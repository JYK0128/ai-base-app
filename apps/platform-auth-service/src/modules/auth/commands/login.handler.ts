import { Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ManagerAccountRepository, UserAccountRepository } from '@pkg/database';
import { Redis } from 'ioredis';

import { ENV } from '@/common/env';
import { CryptoUtil } from '@/common/utils/crypto.util';

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
    private readonly managerAccountRepository: ManagerAccountRepository,
    private readonly userAccountRepository: UserAccountRepository,
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
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

  private async buildLoginResponse(
    account: { id: string, email: string, password: string, accountType: 'manager' | 'user' },
    password: string,
    clientIp: string,
  ) {
    const isPasswordMatch = await CryptoUtil.comparePassword(password, account.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    const payload = {
      sub: account.id,
      email: account.email,
      accountType: account.accountType,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: ENV.JWT_REFRESH_SECRET,
      expiresIn: ENV.JWT_REFRESH_EXPIRES_IN,
    });

    // Redis에 Refresh Token 저장 (Key: auth:refresh:<userId>, TTL 설정)
    await this.redis.set(
      `auth:refresh:${account.id}`,
      refreshToken,
      'EX',
      ENV.JWT_REFRESH_EXPIRES_IN,
    );

    return {
      userId: account.id,
      email: account.email,
      accountType: account.accountType,
      clientIp,
      accessToken,
      refreshToken,
    };
  }
}
