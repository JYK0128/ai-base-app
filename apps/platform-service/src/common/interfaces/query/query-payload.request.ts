export function withQueryPayloadRequest() {
  abstract class MixinClass {}

  return MixinClass;
}

export type QueryPayloadRequest = InstanceType<ReturnType<typeof withQueryPayloadRequest>>;
