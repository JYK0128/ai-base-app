import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { ENV } from './env';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [ENV.RABBITMQ_URL],
      queue: 'auth_queue',
      queueOptions: {
        durable: false,
      },
    },
  });
  await app.listen();
  console.log('Platform Auth Service is consuming RabbitMQ...');
}

void bootstrap();
