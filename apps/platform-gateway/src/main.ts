import 'reflect-metadata';

import { RequestMethod, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from '@/app.module';
import { ENV } from '@/common/env';

export function configureApp(app: NestExpressApplication) {
  const expressApp = app.getHttpAdapter().getInstance();
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.set('trust proxy', 1);
  }

  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'health/live', method: RequestMethod.GET },
      { path: 'health/ready', method: RequestMethod.GET },
    ],
  });

  expressApp.use(cookieParser());

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(
    helmet({
      contentSecurityPolicy: isProduction ? undefined : false,
    }),
  );
  app.enableCors();
  app.enableShutdownHooks();
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);

  configureApp(app);

  const config = new DocumentBuilder()
    .setTitle('AI Base App API')
    .setDescription('The AI Base App Gateway API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = ENV.PORT;
  await app.listen(port, '0.0.0.0');
  logger.log(`Service Gateway is running on: http://localhost:${port}`);
}

void bootstrap();
