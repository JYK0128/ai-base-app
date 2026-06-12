export function withQueryPayloadResponse() {
  abstract class MixinClass {}

  return MixinClass;
}

export type QueryPayloadResponse = InstanceType<ReturnType<typeof withQueryPayloadResponse>>;
