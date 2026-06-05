import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ENV } from '@/env';

import { TermsClient } from './terms.client';
import { TERMS_SERVICE } from './terms.constants';
import { TermsController } from './terms.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: TERMS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: ENV.CORE_SERVICE_HOST,
          port: ENV.CORE_SERVICE_PORT,
        },
      },
    ]),
  ],
  controllers: [TermsController],
  providers: [TermsClient],
  exports: [TermsClient],
})
export class TermsModule {}
