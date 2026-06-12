import { createKeyv } from '@keyv/redis';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MemberAccount } from '@pkg/database';

import { ENV } from '@/env';

import { AuthCacheService } from '../auth/auth.cache';
import { AuthController } from '../auth/auth.controller';
import { LoginHandler } from '../auth/login/login.handler';
import { GetMeHandler } from '../auth/me/get-me.handler';
import { ChangePasswordHandler } from '../auth/password/change-password.handler';
import { DeferPasswordChangeHandler } from '../auth/password/defer-password-change.handler';
import { RefreshTokenHandler } from '../auth/refresh-token/refresh-token.handler';

@Module({
  imports: [
    CqrsModule,
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
    AuthCacheService,
    LoginHandler,
    RefreshTokenHandler,
    ChangePasswordHandler,
    DeferPasswordChangeHandler,
    GetMeHandler,
  ],
})
export class AuthModule {}
