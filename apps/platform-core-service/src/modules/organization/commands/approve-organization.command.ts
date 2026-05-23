/**
 * 조직 승인 커맨드
 */
export class ApproveOrganizationCommand {
  constructor(
    public readonly organizationId: string,
    public readonly approve: boolean,
  ) {}
}
