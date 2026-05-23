import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ENV } from '@/common/env';

import { I18nClient } from './i18n.client';
import { I18N_SERVICE } from './i18n.constants';
import { I18nController } from './i18n.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: I18N_SERVICE,
        transport: Transport.TCP,
        options: {
          host: ENV.CORE_SERVICE_HOST,
          port: ENV.CORE_SERVICE_PORT,
        },
      },
    ]),
  ],
  controllers: [I18nController],
  providers: [I18nClient],
  exports: [I18nClient],
})
export class I18nModule {}
