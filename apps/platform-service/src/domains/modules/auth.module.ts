import { createKeyv } from '@keyv/redis';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { MemberAccount } from '@pkg/database';

import { ENV } from '@/env';

import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { GetMeUseCase } from '../auth/me/get-me.use-case';
import { LoginUseCase } from '../auth/login/login.use-case';
import { ChangePasswordUseCase } from '../auth/password/change-password.use-case';
import { DeferPasswordChangeUseCase } from '../auth/password/defer-password-change.use-case';
import { RefreshTokenUseCase } from '../auth/refresh-token/refresh-token.use-case';

@Module({
  imports: [
    MikroOrmModule.forFeature([MemberAccount]),
    CacheModule.register({
      ttl: 60000,
      stores: [
        createKeyv(ENV.REDIS_URL, {
          namespace: 'auth',
        }),
      ],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LoginUseCase,
    RefreshTokenUseCase,
    ChangePasswordUseCase,
    DeferPasswordChangeUseCase,
    GetMeUseCase,
  ],
})
export class AuthModule {}
