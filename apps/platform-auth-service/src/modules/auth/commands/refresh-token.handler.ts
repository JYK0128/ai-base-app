import { Logger, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus, ManagerAccountRepository, ManagerStatus, OrganizationStatus } from '@pkg/database';

import { ENV } from '@/common/env';
import { JWTPayload } from '@/common/types/request.type';
import { RedisService } from '@/modules/redis/redis.service';

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

      const account = await this.managerAccountRepository.findOne(
        { id: payload.sub },
        { populate: ['manager.organization'] },
      );
      if (!account) {
        throw new UnauthorizedException('계정을 찾을 수 없습니다.');
      }

      if (account.status === AccountStatus.INACTIVE) {
        throw new UnauthorizedException('비활성화된 계정입니다. 관리자에게 문의하세요.');
      }

      if (account.manager?.status === ManagerStatus.INACTIVE) {
        throw new UnauthorizedException('조직 권한이 비활성화되었습니다. 관리자에게 문의하세요.');
      }

      if (account.manager?.organization?.status !== OrganizationStatus.ACTIVE) {
        throw new UnauthorizedException('소속 조직이 활성화 상태가 아닙니다. 관리자에게 문의하세요.');
      }

      const passwordChangeRequired = this.isPasswordExpired(account.passwordExpiresAt);
      if (passwordChangeRequired) {
        throw new UnauthorizedException('비밀번호 변경이 필요합니다.');
      }

      // 3. 새로운 토큰 페이로드 준비
      const newPayload: JWTPayload = {
        sub: payload.sub,
        tenantId: payload.tenantId,
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
        id: payload.sub,
        accessToken,
        refreshToken: newRefreshToken,
        tenantId: payload.tenantId,
      };
    }
    catch (error) {
      this.logger.error('Invalid refresh token', error);
      throw new UnauthorizedException('유효하지 않거나 만료된 리프레시 토큰입니다.');
    }
  }

  private isPasswordExpired(passwordExpiresAt?: Date | null) {
    return !passwordExpiresAt || Date.now() > passwordExpiresAt.getTime();
  }
}
