export class AuditLogEvent {
  constructor(
    public readonly action: string,
    public readonly metadata: Record<string, unknown>,
    public readonly timestamp: Date = new Date(),
  ) {}
}
