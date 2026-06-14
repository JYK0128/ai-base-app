import { createKeyv } from '@keyv/redis';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MemberAccount } from '@pkg/database';

import { ENV } from '@/env';

import { AuthCacheService } from '../auth/auth.cache';
import { AuthController } from '../auth/auth.controller';
import { ChangePasswordHandler } from '../auth/change-password/change-password.handler';
import { DeferPasswordChangeHandler } from '../auth/defer-password-change/defer-password-change.handler';
import { LoginHandler } from '../auth/login/login.handler';
import { GetMeHandler } from '../auth/me/get-me.handler';
import { RefreshTokenHandler } from '../auth/refresh-token/refresh-token.handler';
import { TermsModule } from '../terms/terms.module';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([MemberAccount]),
    TermsModule,
    CacheModule.register({
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
