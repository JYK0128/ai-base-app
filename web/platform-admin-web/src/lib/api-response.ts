function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function resolveApiPayload(response: unknown): Record<string, unknown> | undefined {
  if (!isRecord(response)) {
    return undefined;
  }

  if (isRecord(response.data)) {
    return response.data;
  }

  return response;
}

type InferApiData<TResponse> = TResponse extends { data: infer TData }
  ? NonNullable<TData>
  : NonNullable<TResponse>;

type InferApiItems<TResponse> = TResponse extends { items: infer TItems }
  ? TItems extends readonly (infer TItem)[]
    ? TItem[]
    : never[]
  : TResponse extends { data: { items: infer TItems } }
    ? TItems extends readonly (infer TItem)[]
      ? TItem[]
      : never[]
    : never[];

export function pickApiData<TResponse>(
  response: TResponse,
): InferApiData<TResponse> | undefined {
  const payload = resolveApiPayload(response);

  if (payload === undefined) {
    return undefined;
  }

  return payload as InferApiData<TResponse>;
}

export function pickApiItems<TResponse>(
  response: TResponse,
): InferApiItems<TResponse> {
  const payload = resolveApiPayload(response);

  if (payload === undefined || !Array.isArray(payload.items)) {
    return [] as InferApiItems<TResponse>;
  }

  return payload.items as InferApiItems<TResponse>;
}
