import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { ENV } from './env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.startAllMicroservices();
  await app.listen(ENV.PORT);

  console.log(`Platform Auth Service health server is listening on port ${ENV.PORT}`);
  console.log('Platform Auth Service is consuming RabbitMQ...');
}

void bootstrap();
