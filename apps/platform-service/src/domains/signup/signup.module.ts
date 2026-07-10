import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TermsDocument, TermsVersion } from '@pkg/database';

import { GetSignupTermListHandler } from './get-signup-term-list/get-signup-term-list.handler';
import { SignupController } from './signup.controller';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([TermsDocument, TermsVersion]),
  ],
  controllers: [SignupController],
  providers: [GetSignupTermListHandler],
})
export class SignupModule {}
