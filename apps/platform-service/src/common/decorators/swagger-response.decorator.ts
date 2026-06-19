import { applyDecorators, RequestMethod, type Type } from '@nestjs/common';
import { METHOD_METADATA } from '@nestjs/common/constants';
import { ApiCreatedResponse, ApiExtraModels, ApiNoContentResponse, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

import { ApiResponse } from '@/common/types/response.type';

type SwaggerResponseDataDto<T extends Type<unknown>> = T | [T];

const resolveResponseDecorator = (method: RequestMethod | undefined, hasDataDto: boolean) => {
  switch (method) {
    case RequestMethod.POST:
      return ApiCreatedResponse;
    case RequestMethod.DELETE:
      return hasDataDto ? ApiOkResponse : ApiNoContentResponse;
    default:
      return ApiOkResponse;
  }
};

export const SwaggerResponse = <T extends Type<unknown>>(dataDto?: SwaggerResponseDataDto<T>) => {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    queueMicrotask(() => {
      const decorators = [ApiExtraModels(ApiResponse)];
      const methodTarget = descriptor.value as object;
      const method = Reflect.getMetadata(METHOD_METADATA, methodTarget) as RequestMethod | undefined;
      const responseDecorator = resolveResponseDecorator(method, dataDto !== undefined);

      if (dataDto) {
        const isArrayResponse = Array.isArray(dataDto);
        const dto = isArrayResponse ? dataDto[0] : dataDto;

        decorators.push(ApiExtraModels(dto));
        decorators.push(
          responseDecorator({
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
      else if (responseDecorator === ApiNoContentResponse) {
        decorators.push(responseDecorator());
      }
      else {
        decorators.push(
          responseDecorator({
            type: ApiResponse,
          }),
        );
      }

      applyDecorators(...decorators)(target, propertyKey, descriptor);
    });

    return descriptor;
  };
};
