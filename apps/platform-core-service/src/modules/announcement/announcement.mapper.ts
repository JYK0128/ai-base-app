import type { Announcement, Member } from '@pkg/database';

import type { AnnouncementAudience,
              AnnouncementCategory,
              AnnouncementChannel,
              AnnouncementInput,
              AnnouncementMetadata,
              AnnouncementPriority,
              AnnouncementRecord,
              AnnouncementStatus } from './announcement.types';

const DEFAULT_CATEGORY: AnnouncementCategory = 'NOTICE';
const DEFAULT_AUDIENCE: AnnouncementAudience = 'ALL';
const DEFAULT_CHANNEL: AnnouncementChannel = 'IN_APP';
const DEFAULT_PRIORITY: AnnouncementPriority = 'NORMAL';

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
    case 'MAINTENANCE':
    case 'SECURITY':
    case 'EVENT':
    case 'NOTICE':
      return value;
    default:
      return DEFAULT_CATEGORY;
  }
}

function resolveAnnouncementAudience(value: unknown): AnnouncementAudience {
  switch (value) {
    case 'PLATFORM':
    case 'ORGANIZATION':
    case 'ALL':
      return value;
    default:
      return DEFAULT_AUDIENCE;
  }
}

function resolveAnnouncementChannel(value: unknown): AnnouncementChannel {
  switch (value) {
    case 'EMAIL':
    case 'PUSH':
    case 'IN_APP':
      return value;
    default:
      return DEFAULT_CHANNEL;
  }
}

function resolveAnnouncementPriority(value: unknown): AnnouncementPriority {
  switch (value) {
    case 'LOW':
    case 'HIGH':
    case 'NORMAL':
      return value;
    default:
      return DEFAULT_PRIORITY;
  }
}

function resolveAnnouncementStatus(input: AnnouncementInput, isPublished: boolean): AnnouncementStatus {
  if (input.status === 'DRAFT' || input.status === 'PUBLISHED') {
    return input.status;
  }

  return isPublished ? 'PUBLISHED' : 'DRAFT';
}

function resolveAnnouncementDate(value: string | undefined): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString();
}

function getAnnouncementMetadata(announcement: Announcement): AnnouncementMetadata {
  const metadata = (announcement.metadata ?? {}) as Partial<AnnouncementMetadata>;

  return {
    category: resolveAnnouncementCategory(metadata.category),
    audience: resolveAnnouncementAudience(metadata.audience),
    channel: resolveAnnouncementChannel(metadata.channel),
    priority: resolveAnnouncementPriority(metadata.priority),
    pinned: metadata.pinned === true,
    startAt: resolveAnnouncementDate(metadata.startAt),
    endAt: resolveAnnouncementDate(metadata.endAt),
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
  const status = announcement.isPublished ? 'PUBLISHED' : 'DRAFT';
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
    startAt: metadata.startAt,
    endAt: metadata.endAt,
    createdAt: announcement.createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

function resolveAnnouncementPublished(input: AnnouncementInput): boolean {
  if (typeof input.isPublished === 'boolean') {
    return input.isPublished;
  }

  if (input.status === 'PUBLISHED') {
    return true;
  }

  if (input.status === 'DRAFT') {
    return false;
  }

  return false;
}

export function applyAnnouncementInput(
  announcement: Announcement,
  input: AnnouncementInput,
) {
  const metadata = (announcement.metadata ?? {}) as Partial<AnnouncementMetadata>;

  announcement.title = input.title.trim();
  announcement.content = input.content.trim();
  announcement.isPublished = resolveAnnouncementPublished(input);
  announcement.metadata = {
    ...metadata,
    category: resolveAnnouncementCategory(input.category ?? metadata.category),
    audience: resolveAnnouncementAudience(input.audience ?? metadata.audience),
    channel: resolveAnnouncementChannel(input.channel ?? metadata.channel),
    priority: resolveAnnouncementPriority(input.priority ?? metadata.priority),
    pinned: typeof input.pinned === 'boolean' ? input.pinned : metadata.pinned === true,
    startAt: resolveAnnouncementDate(input.startAt ?? metadata.startAt),
    endAt: resolveAnnouncementDate(input.endAt ?? metadata.endAt),
  };
}

export function getAnnouncementStatus(input: AnnouncementInput): AnnouncementStatus {
  return resolveAnnouncementStatus(input, resolveAnnouncementPublished(input));
}
