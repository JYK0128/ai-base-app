export interface Factory<TBase> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): TBase
  create(params: unknown): Promise<TBase>
}
