import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { I18nLocale } from '@pkg/database';

import { I18nController } from './i18n.controller';
import { GetLocaleListHandler } from './locale-list/get-locale-list.handler';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([I18nLocale]),
  ],
  controllers: [I18nController],
  providers: [GetLocaleListHandler],
})
export class I18nModule {}
