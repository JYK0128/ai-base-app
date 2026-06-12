export function withPayloadRequestDto() {
  abstract class MixinClass {}

  return MixinClass;
}

export type PayloadRequestDto = InstanceType<ReturnType<typeof withPayloadRequestDto>>;
