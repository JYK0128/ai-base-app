import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from '@/app.module';
import { ENV } from '@/common/env';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);

  const isProduction = process.env.NODE_ENV === 'production';

  // 0. 프록시(Nginx 등)를 통한 실제 사용자 IP 신뢰 설정 (상용 환경에서만 활성화)
  if (isProduction) {
    app.set('trust proxy', 1);
  }

  app.setGlobalPrefix('api', {
    exclude: ['health/(.*)'],
  });

  app.use(cookieParser());

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
      contentSecurityPolicy: isProduction ? undefined : false, // 개발 환경에서 Swagger UI 깨짐 방지
    }),
  );
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('AI Base App API')
    .setDescription('The AI Base App Gateway API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableShutdownHooks();

  // 워치 모드에서 프로세스 교체 시 포트 점유 에러(EADDRINUSE) 방지를 위한 재시도 로직
  const maxRetries = 10;
  let retries = 0;
  const port = ENV.PORT;

  while (retries < maxRetries) {
    try {
      await app.listen(port, '0.0.0.0');
      logger.log(`Service Gateway is running on: http://localhost:${port}`);
      break;
    }
    catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === 'EADDRINUSE') {
        retries++;
        logger.warn(`Port ${port} is busy, retrying... (${retries}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      else {
        throw err;
      }
    }
  }
}
void bootstrap();
