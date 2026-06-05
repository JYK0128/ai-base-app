import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ENV } from '@/env';

import { OrganizationsClient } from './organizations.client';
import { ORGANIZATIONS_SERVICE } from './organizations.constants';
import { OrganizationsController } from './organizations.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ORGANIZATIONS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: ENV.CORE_SERVICE_HOST,
          port: ENV.CORE_SERVICE_PORT,
        },
      },
    ]),
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsClient],
  exports: [OrganizationsClient],
})
export class OrganizationsModule {}
