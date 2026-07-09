import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Member, MemberAccount, MemberInvite, OrganizationRoleAssignment, TermsConsent, TermsDocument, TermsVersion } from '@pkg/database';

import { AcceptJoinHandler } from './accept/accept-join.handler';
import { JoinController } from './join.controller';
import { VerifyJoinHandler } from './verify/verify-join.handler';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([
      Member,
      MemberAccount,
      MemberInvite,
      OrganizationRoleAssignment,
      TermsConsent,
      TermsDocument,
      TermsVersion,
    ]),
  ],
  controllers: [JoinController],
  providers: [VerifyJoinHandler, AcceptJoinHandler],
})
export class JoinModule {}
