import type { Announcement, Member } from '@pkg/database';
import { AnnouncementAudience, AnnouncementCategory, AnnouncementChannel, AnnouncementMetadata as AnnouncementEntityMetadata, AnnouncementPriority } from '@pkg/database';

import type { AnnouncementInput, AnnouncementRecord, AnnouncementRecordMetadata, AnnouncementStatus } from './announcement.types';

const DEFAULT_CATEGORY = AnnouncementCategory.NOTICE;
const DEFAULT_AUDIENCE = AnnouncementAudience.ALL;
const DEFAULT_CHANNEL = AnnouncementChannel.IN_APP;
const DEFAULT_PRIORITY = AnnouncementPriority.NORMAL;

function buildSummary(content: string) {
  const firstLine = content
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0)
    ?? '';

  if (!firstLine) {
    return '공지 내용을 입력하세요.';
  }

  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}...` : firstLine;
}

function resolveAnnouncementCategory(value: unknown): AnnouncementCategory {
  switch (value) {
    case AnnouncementCategory.NOTICE:
    case AnnouncementCategory.MAINTENANCE:
    case AnnouncementCategory.SECURITY:
    case AnnouncementCategory.EVENT:
      return value;
    default:
      return DEFAULT_CATEGORY;
  }
}

function resolveAnnouncementAudience(value: unknown): AnnouncementAudience {
  switch (value) {
    case AnnouncementAudience.PLATFORM:
    case AnnouncementAudience.ORGANIZATION:
    case AnnouncementAudience.ALL:
      return value;
    default:
      return DEFAULT_AUDIENCE;
  }
}

function resolveAnnouncementChannel(value: unknown): AnnouncementChannel {
  switch (value) {
    case AnnouncementChannel.EMAIL:
    case AnnouncementChannel.PUSH:
    case AnnouncementChannel.IN_APP:
      return value;
    default:
      return DEFAULT_CHANNEL;
  }
}

function resolveAnnouncementPriority(value: unknown): AnnouncementPriority {
  switch (value) {
    case AnnouncementPriority.LOW:
    case AnnouncementPriority.HIGH:
    case AnnouncementPriority.NORMAL:
      return value;
    default:
      return DEFAULT_PRIORITY;
  }
}

function resolveAnnouncementStatus(isPublished: boolean): AnnouncementStatus {
  return isPublished ? 'PUBLISHED' : 'DRAFT';
}

function parseAnnouncementDate(value: string | Date | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

function formatAnnouncementDate(value: Date | string | undefined): string {
  const date = parseAnnouncementDate(value);

  if (!date) {
    return '';
  }

  return date.toISOString();
}

function getEntityMetadata(announcement: Announcement): AnnouncementEntityMetadata {
  const metadata = announcement.metadata;

  if (metadata instanceof AnnouncementEntityMetadata) {
    return metadata;
  }

  return new AnnouncementEntityMetadata(metadata);
}

function getAnnouncementMetadata(announcement: Announcement): AnnouncementRecordMetadata {
  const metadata = getEntityMetadata(announcement);

  return {
    category: resolveAnnouncementCategory(metadata.category),
    audience: resolveAnnouncementAudience(metadata.audience),
    channel: resolveAnnouncementChannel(metadata.channel),
    priority: resolveAnnouncementPriority(metadata.priority),
    pinned: metadata.pinned === true,
    publishedAt: formatAnnouncementDate(metadata.publishedAt),
    startAt: formatAnnouncementDate(metadata.startAt),
    endAt: formatAnnouncementDate(metadata.endAt),
  };
}

function getAuthorDisplayName(author: Member): string {
  const latestAccount = [...author.accounts.getItems()]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0];

  return latestAccount?.email ?? author.name;
}

export function buildAnnouncementRecord(
  announcement: Announcement,
): AnnouncementRecord {
  const metadata = getAnnouncementMetadata(announcement);
  const status = resolveAnnouncementStatus(announcement.isPublished);
  const updatedAt = announcement.updatedAt ?? announcement.createdAt;

  return {
    id: announcement.id,
    title: announcement.title,
    summary: buildSummary(announcement.content),
    content: announcement.content,
    category: metadata.category,
    audience: metadata.audience,
    channel: metadata.channel,
    priority: metadata.priority,
    status,
    isPublished: announcement.isPublished,
    pinned: metadata.pinned,
    author: getAuthorDisplayName(announcement.author),
    publishedAt: metadata.publishedAt,
    startAt: metadata.startAt,
    endAt: metadata.endAt,
    createdAt: announcement.createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

export function applyAnnouncementInput(
  announcement: Announcement,
  input: AnnouncementInput,
) {
  const metadata = getEntityMetadata(announcement);

  announcement.title = input.title.trim();
  announcement.content = input.content.trim();
  const category = resolveAnnouncementCategory(input.category ?? metadata.category);
  const audience = resolveAnnouncementAudience(input.audience ?? metadata.audience);
  const channel = resolveAnnouncementChannel(input.channel ?? metadata.channel);
  const priority = resolveAnnouncementPriority(input.priority ?? metadata.priority);

  announcement.metadata = new AnnouncementEntityMetadata({
    ...metadata,
    category,
    audience,
    channel,
    priority,
    pinned: typeof input.pinned === 'boolean' ? input.pinned : metadata.pinned === true,
    publishedAt: input.publishedAt === undefined ? metadata.publishedAt : parseAnnouncementDate(input.publishedAt),
    startAt: input.startAt === undefined ? metadata.startAt : parseAnnouncementDate(input.startAt),
    endAt: input.endAt === undefined ? metadata.endAt : parseAnnouncementDate(input.endAt),
  });
}

export function getAnnouncementStatus(announcement: Announcement): AnnouncementStatus {
  return resolveAnnouncementStatus(announcement.isPublished);
}
