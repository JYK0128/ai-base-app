import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SwaggerResult } from '@/common/decorators/swagger.decorator';
import { ApiResponse } from '@/common/types/response.type';

import { TranslationBulkDto,
         TranslationCreateDto,
         TranslationDeleteDto,
         TranslationParamDto,
         TranslationQueryDto,
         TranslationsQueryDto,
         TranslationUpdateDto } from './dto/i18n-request.dto';
import { LocalesDataDto,
         TranslationBulkDataDto,
         TranslationCreateDataDto,
         TranslationDataDto,
         TranslationDeleteDataDto,
         TranslationListDataDto,
         TranslationUpdateDataDto } from './dto/i18n-response.dto';
import { I18nClient } from './i18n.client';

@ApiTags('I18n')
@ApiBearerAuth()
@Controller('i18n')
export class I18nController {
  constructor(private readonly i18nClient: I18nClient) {}

  @Get('locales')
  @ApiOperation({ summary: '로케일 목록 조회', description: '로케일 목록을 조회합니다.' })
  @SwaggerResult(LocalesDataDto)
  async getLocales() {
    const result = await this.i18nClient.getLocales();
    return ApiResponse.success(result, '로케일 목록을 조회했습니다.');
  }

  @Get('translations/:namespace/:key')
  @ApiOperation({ summary: '번역 단건 조회', description: '단건 번역을 조회합니다.' })
  @SwaggerResult(TranslationDataDto)
  async getTranslation(
    @Param() params: TranslationParamDto,
    @Query() query: TranslationQueryDto,
  ) {
    const result = await this.i18nClient.getTranslation({
      ...params,
      locale: query.locale,
    });
    return ApiResponse.success(result, '번역을 조회했습니다.');
  }

  @Get('translations')
  @ApiOperation({ summary: '번역 배치 조회', description: '번역 목록을 조회합니다.' })
  @SwaggerResult(TranslationListDataDto)
  async getTranslations(@Query() query: TranslationsQueryDto) {
    const result = await this.i18nClient.getTranslations(query);
    return ApiResponse.success(result, '번역 목록을 조회했습니다.');
  }

  @Post('translations/bulk')
  @ApiOperation({ summary: '번역 일괄 처리', description: '번역을 일괄 처리합니다.' })
  @SwaggerResult(TranslationBulkDataDto)
  async bulkTranslations(@Body() dto: TranslationBulkDto) {
    const result = await this.i18nClient.bulkTranslations(dto);
    return ApiResponse.success(result, '번역을 일괄 처리했습니다.');
  }

  @Post('translations')
  @ApiOperation({ summary: '번역 생성', description: '번역을 생성합니다.' })
  @SwaggerResult(TranslationCreateDataDto)
  async createTranslation(@Body() dto: TranslationCreateDto) {
    const result = await this.i18nClient.createTranslation(dto);
    return ApiResponse.success(result, '번역을 생성했습니다.');
  }

  @Post('translations/update')
  @ApiOperation({ summary: '번역 수정', description: '번역을 수정합니다.' })
  @SwaggerResult(TranslationUpdateDataDto)
  async updateTranslation(@Body() dto: TranslationUpdateDto) {
    const result = await this.i18nClient.updateTranslation(dto);
    return ApiResponse.success(result, '번역을 수정했습니다.');
  }

  @Post('translations/delete')
  @ApiOperation({ summary: '번역 삭제', description: '번역을 삭제합니다.' })
  @SwaggerResult(TranslationDeleteDataDto)
  async deleteTranslation(@Body() dto: TranslationDeleteDto) {
    const result = await this.i18nClient.deleteTranslation(dto);
    return ApiResponse.success(result, '번역을 삭제했습니다.');
  }
}
