import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

import { ApiResponse } from '@/common/types/response.type';

type SwaggerResultDataDto<T extends Type<unknown>> = T | [T];

export const SwaggerResult = <T extends Type<unknown>>(dataDto?: SwaggerResultDataDto<T>) => {
  const decorators = [ApiExtraModels(ApiResponse)];

  if (dataDto) {
    const isArrayResponse = Array.isArray(dataDto);
    const dto = isArrayResponse ? dataDto[0] : dataDto;

    decorators.push(ApiExtraModels(dto));
    decorators.push(
      ApiOkResponse({
        schema: {
          allOf: [
            { $ref: getSchemaPath(ApiResponse) },
            {
              properties: {
                data: isArrayResponse
                  ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(dto) },
                  }
                  : { $ref: getSchemaPath(dto) },
              },
            },
          ],
        },
      }),
    );
  }
  else {
    decorators.push(
      ApiOkResponse({
        type: ApiResponse,
      }),
    );
  }

  return applyDecorators(...decorators);
};
