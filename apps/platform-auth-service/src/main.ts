import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';

import { AppModule } from '@/app.module';
import { ENV } from '@/common/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: ENV.TCP_PORT,
    },
  }, { inheritAppConfig: true });

  app.enableShutdownHooks();
  await app.startAllMicroservices();
  await app.listen(ENV.PORT);

  logger.log(`Platform Auth Service Health Check is listening on port ${ENV.PORT}`);
  logger.log(`Platform Auth Service Microservice (TCP) is listening on port ${ENV.TCP_PORT}`);
}

void bootstrap();
