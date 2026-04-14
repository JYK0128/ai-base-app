export class LoginCommand {
  constructor(
    public readonly userId: string,
    public readonly clientIp: string,
  ) {}
}
