import { Logger, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ManagerAccountRepository } from '@pkg/database';

import { ENV } from '@/common/env';
import { JWTPayload } from '@/common/types/request.type';

import { RedisService } from '../../redis/redis.service';

export class RefreshTokenCommand {
  constructor(public readonly refreshToken: string) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  private readonly logger = new Logger(RefreshTokenHandler.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly managerAccountRepository: ManagerAccountRepository,
  ) {}

  async execute(command: RefreshTokenCommand) {
    const { refreshToken } = command;
    this.logger.log('Executing RefreshTokenCommand');

    try {
      // 1. JWT 기본 검증
      const payload = await this.jwtService.verifyAsync<JWTPayload>(refreshToken, {
        secret: ENV.JWT_REFRESH_SECRET,
      });

      // 2. Redis에 저장된 토큰과 일치하는지 확인
      const storedToken = await this.redisService.get(`refresh:${payload.sub}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('유효하지 않거나 만료된 세션입니다.');
      }

      const account = await this.managerAccountRepository.findOne({ id: payload.sub });
      if (!account) {
        throw new UnauthorizedException('계정을 찾을 수 없습니다.');
      }

      const passwordChangeRequired = account.forcePasswordChange || this.isPasswordExpired(account.nextPasswordChangeAt);

      // 3. 새로운 토큰 페이로드 준비
      const newPayload = {
        sub: payload.sub,
        email: payload.email,
        sid: payload.sid,
        tenantId: payload.tenantId,
        passwordChangeRequired,
      };

      // 4. 토큰 재발급 및 Redis 갱신 (Token Rotation)
      const accessToken = await this.jwtService.signAsync(newPayload);
      const newRefreshToken = await this.jwtService.signAsync(newPayload, {
        secret: ENV.JWT_REFRESH_SECRET,
        expiresIn: ENV.JWT_REFRESH_EXPIRES_IN,
      });

      await this.redisService.set(
        `refresh:${payload.sub}`,
        newRefreshToken,
        ENV.JWT_REFRESH_EXPIRES_IN,
      );

      return {
        accessToken,
        refreshToken: newRefreshToken,
        tenantId: payload.tenantId,
        passwordChangeRequired,
      };
    }
    catch (error) {
      this.logger.error('Invalid refresh token', error);
      throw new UnauthorizedException('유효하지 않거나 만료된 리프레시 토큰입니다.');
    }
  }

  private isPasswordExpired(nextPasswordChangeAt: Date) {
    return Date.now() > nextPasswordChangeAt.getTime();
  }
}
