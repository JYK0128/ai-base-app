export function withCommandPayloadResponse() {
  abstract class MixinClass {}

  return MixinClass;
}

export type CommandPayloadResponse = InstanceType<ReturnType<typeof withCommandPayloadResponse>>;
