import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { I18nLocale, I18nTranslation } from '@pkg/database';

import { I18nHandlers } from './handlers';
import { I18nController } from './i18n.controller';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([I18nLocale, I18nTranslation]),
  ],
  controllers: [I18nController],
  providers: [...I18nHandlers],
})
export class I18nModule {}
