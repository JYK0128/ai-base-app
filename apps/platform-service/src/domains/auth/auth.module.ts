import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MemberAccount, TermsConsent, TermsDocument, TermsVersion } from '@pkg/database';

import { AppCacheModule } from '@/common/modules/app-cache.module';

import { CreateTermsAgreementHandler } from './agree-terms/agree-terms.handler';
import { AllowedResourceListHandler } from './allowed-resource-list/allowed-resource-list.handler';
import { AuthController } from './auth.controller';
import { ChangePasswordHandler } from './change-password/change-password.handler';
import { DeferPasswordChangeHandler } from './defer-password-change/defer-password-change.handler';
import { LoginHandler } from './login/login.handler';
import { MeHandler } from './me/me.handler';
import { PendingTermListHandler } from './pending-term-list/pending-term-list.handler';

@Module({
  imports: [
    AppCacheModule.register('auth'),
    CqrsModule,
    MikroOrmModule.forFeature([MemberAccount, TermsConsent, TermsDocument, TermsVersion]),
  ],
  controllers: [AuthController],
  providers: [
    LoginHandler,
    ChangePasswordHandler,
    DeferPasswordChangeHandler,
    MeHandler,
    AllowedResourceListHandler,
    PendingTermListHandler,
    CreateTermsAgreementHandler,
  ],
  exports: [],
})
export class AuthModule {}
