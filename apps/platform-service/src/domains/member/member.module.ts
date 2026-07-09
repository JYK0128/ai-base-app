import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Member, MemberInvite, Organization, OrganizationRole } from '@pkg/database';

import { ENV } from '@/env';

import { InviteEmailPublisher } from '../mail/invite-email/invite-email.publisher';
import { MAIL_QUEUE_NAMES } from '../mail/mail.contract';
import { CancelInviteHandler } from './cancel-invite/cancel-invite.handler';
import { CreateInviteHandler } from './create-invite/create-invite.handler';
import { GetInvitePageHandler } from './get-invite-page/get-invite-page.handler';
import { GetMemberHandler } from './get-member/get-member.handler';
import { GetMemberPageHandler } from './get-member-page/get-member-page.handler';
import { MembersController } from './member.controller';
import { ResendInviteHandler } from './resend-invite/resend-invite.handler';
import { UpdateMemberRoleHandler } from './update-member-role/update-member-role.handler';
import { UpdateMemberStatusHandler } from './update-member-status/update-member-status.handler';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Member, MemberInvite, Organization, OrganizationRole]),
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [ENV.RABBITMQ_URL],
          queue: MAIL_QUEUE_NAMES.INVITE_SEND,
          queueOptions: {
            durable: true,
          },
          socketOptions: {
            frameMax: 8192,
          },
        },
      },
    ]),
  ],
  controllers: [MembersController],
  providers: [GetMemberHandler, GetMemberPageHandler, GetInvitePageHandler, CreateInviteHandler, CancelInviteHandler, ResendInviteHandler, UpdateMemberRoleHandler, UpdateMemberStatusHandler, InviteEmailPublisher],
})
export class MemberModule {}
