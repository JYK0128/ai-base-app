import 'reflect-metadata';

import { MikroORM } from '@mikro-orm/core';
import { RequestMethod, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from '@/app.module';
import { applySwaggerSchemas } from '@/common/decorators/swagger-schema.decorator';
import { MAIL_QUEUE_NAMES } from '@/domains/mail/mail.contract';
import { ENV } from '@/env';

export function configureApp(app: NestExpressApplication) {
  const isProduction = ENV.NODE_ENV === 'production';

  if (isProduction) {
    app.set('trust proxy', 1);
  }

  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'health/live', method: RequestMethod.GET },
      { path: 'health/ready', method: RequestMethod.GET },
    ],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));
  app.set('query parser', 'extended');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(
    helmet({
      ...(isProduction ? {} : { contentSecurityPolicy: false }),
    }),
  );

  app.enableCors({
    origin: ENV.CORS_ORIGIN,
    credentials: true,
  });

  app.enableShutdownHooks();
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.disable('etag');

  configureApp(app);

  const orm = app.get(MikroORM);
  await orm.connect();

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [ENV.RABBITMQ_URL],
      queue: MAIL_QUEUE_NAMES.INVITE_SEND,
      queueOptions: {
        durable: true,
      },
      socketOptions: {
        frameMax: 8192,
      },
    },
  });
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [ENV.RABBITMQ_URL],
      queue: MAIL_QUEUE_NAMES.INVITE_DELIVERY_RESULT,
      noAck: false,
      prefetchCount: 100,
      queueOptions: {
        durable: true,
      },
      socketOptions: {
        frameMax: 8192,
      },
    },
  });

  if (ENV.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('AI Base App Platform Service API')
      .setDescription('The AI Base App Platform Service API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    applySwaggerSchemas(document);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  const port = ENV.PORT;
  await app.startAllMicroservices();
  await app.listen(port, '0.0.0.0');
  logger.log(`Platform Service is running on: http://localhost:${port}`);
}

void bootstrap();
