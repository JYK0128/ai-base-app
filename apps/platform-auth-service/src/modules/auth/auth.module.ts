import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ManagerAccount, UserAccount } from '@pkg/database';

import { ENV } from '@/common/env';

import { AuthController } from './auth.controller';
import { Handlers } from './handlers';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([
      ManagerAccount,
      UserAccount,
    ]),
    JwtModule.register({
      secret: ENV.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: ENV.JWT_ACCESS_EXPIRES_IN },
    }),
  ],
  controllers: [AuthController],
  providers: [...Handlers],
})
export class AuthModule { }
