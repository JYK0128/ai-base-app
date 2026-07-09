export function isAnnouncementPublished(publishedAt: Date | null): boolean {
  if (!publishedAt) {
    return false;
  }

  return Number.isFinite(publishedAt.getTime());
}
