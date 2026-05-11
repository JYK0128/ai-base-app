import { Logger, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus, ManagerAccountRepository, ManagerStatus, OrganizationStatus } from '@pkg/database';

import { ENV } from '@/common/env';
import type { JWTPayload } from '@/common/types/request.type';
import { TokenUtil } from '@/common/utils/token.util';
import { RedisService } from '@/modules/redis/redis.service';

import { extractPermissions } from '../auth.helpers';

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

      if (payload.typ !== 'refresh') {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }

      // 2. Redis에 저장된 토큰과 일치하는지 확인
      const storedToken = await this.redisService.get(`refresh:${payload.sub}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('유효하지 않거나 만료된 세션입니다.');
      }

      const account = await this.managerAccountRepository.findOne(
        { id: payload.sub },
        { populate: ['manager.organization', 'manager.roles.role.permissions.permission'] },
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

      // 비밀번호 만료 여부 확인
      const mustChangePassword = account.isPasswordExpired();

      // 권한 정보 조회
      const { roles, permissions } = extractPermissions(account.manager, payload.organizationId);

      // 3. 토큰 재발급 및 Redis 갱신 (Token Rotation)
      const { accessToken, refreshToken: newRefreshToken } = await TokenUtil.generateTokens({
        sub: account.id,
        organizationId: payload.organizationId,
        mustChangePassword,
        roles,
        permissions,
      });

      await this.redisService.set(
        `refresh:${account.id}`,
        newRefreshToken,
        ENV.JWT_REFRESH_EXPIRES_IN,
      );

      return {
        id: payload.sub,
        accessToken,
        refreshToken: newRefreshToken,
        organizationId: payload.organizationId,
      };
    }
    catch (error) {
      this.logger.error('Invalid refresh token', error);
      throw new UnauthorizedException('유효하지 않거나 만료된 리프레시 토큰입니다.');
    }
  }
}
