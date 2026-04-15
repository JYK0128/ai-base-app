import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ManagerAccount } from '@pkg/database/src/domains/manager/manager.account.entity';
import { UserAccount } from '@pkg/database/src/domains/site/user.account.entity';

import { AuthController } from './auth.controller';
import { Handlers } from './handlers';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([ManagerAccount, UserAccount]),
  ],
  controllers: [AuthController],
  providers: [...Handlers],
})
export class AuthModule {}
