import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

import { ApiResponse } from '@/common/types/response.type';

export const SwaggerResult = <T extends Type<unknown>>(dataDto?: T) => {
  const decorators = [ApiExtraModels(ApiResponse)];

  if (dataDto) {
    decorators.push(ApiExtraModels(dataDto));
    decorators.push(
      ApiOkResponse({
        schema: {
          allOf: [
            { $ref: getSchemaPath(ApiResponse) },
            {
              properties: {
                data: { $ref: getSchemaPath(dataDto) },
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
