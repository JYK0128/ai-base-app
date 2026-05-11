export class CreateAnnouncementCommand {
  constructor(
    public readonly authorId: string,
    public readonly title: string,
    public readonly content: string,
    public readonly isPublished?: boolean,
  ) {}
}
