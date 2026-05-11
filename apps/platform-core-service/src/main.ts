import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { ENV } from './common/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(app.get(Logger));

  // Enable microservice (TCP)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: ENV.TCP_PORT,
    },
  }, { inheritAppConfig: true });

  await app.startAllMicroservices();
  await app.listen(ENV.PORT);

  console.log(`🚀 Platform Core Service is running on: http://localhost:${ENV.PORT}`);
  console.log(`📡 TCP Microservice listening on port: ${ENV.TCP_PORT}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start Platform Core Service:', err);
  process.exit(1);
});
