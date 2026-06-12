export function withPayloadResponseDto() {
  abstract class MixinClass {}

  return MixinClass;
}

export type PayloadResponseDto = InstanceType<ReturnType<typeof withPayloadResponseDto>>;
