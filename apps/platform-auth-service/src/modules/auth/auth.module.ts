import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MemberAccount } from '@pkg/database';

import { RedisModule } from '../redis/redis.module';
import { AuthController } from './auth.controller';
import { Handlers } from './handlers';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([MemberAccount]),
    RedisModule.forFeature({ namespace: 'auth' }),
  ],
  controllers: [AuthController],
  providers: [...Handlers],
})
export class AuthModule {}
