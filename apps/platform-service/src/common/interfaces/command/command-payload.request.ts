export function withCommandPayloadRequest() {
  abstract class MixinClass {}

  return MixinClass;
}

export type CommandPayloadRequest = InstanceType<ReturnType<typeof withCommandPayloadRequest>>;
