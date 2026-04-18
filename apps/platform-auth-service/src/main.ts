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
    transport: Transport.RMQ,
    options: {
      urls: [ENV.RABBITMQ_URL],
      queue: 'auth_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  app.enableShutdownHooks();
  await app.startAllMicroservices();
  await app.listen(ENV.PORT);

  logger.log(`Platform Auth Service health server is listening on port ${ENV.PORT}`);
  logger.log('Platform Auth Service is consuming RabbitMQ...');
}

void bootstrap();
