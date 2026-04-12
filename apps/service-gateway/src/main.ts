import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ENV } from './env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(ENV.PORT, '0.0.0.0');
  console.log(`Service Gateway is running on: ${await app.getUrl()}`);
}
void bootstrap();
