import type { AnnouncementPageItem, AnnouncementPageItemAudience, CreateAnnouncementRequestDto, UpdateAnnouncementRequestDto } from '@/api/generated/model';

import type { AnnouncementEditorSeed, AnnouncementEditorState } from './announcements-types.helper';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function isValidDate(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

function toDateTimeInputValue(value: string): string {
  if (!value || !isValidDate(value)) {
    return '';
  }

  const date = new Date(value);
  const timezoneOffsetMinutes = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - timezoneOffsetMinutes * 60_000);

  return localDate.toISOString().slice(0, 16);
}

function fromDateTimeInputValue(value: string): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  return isValidDate(value) ? date.toISOString() : '';
}

function normalizeEditorAudience(audience: AnnouncementPageItemAudience): AnnouncementPageItemAudience {
  return audience === 'PLATFORM' ? 'ALL' : audience;
}

export function formatDateTime(value: string): string {
  if (!value || !isValidDate(value)) {
    return '-';
  }

  const date = new Date(value);
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizeAnnouncementPreviewLine(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  let index = 0;

  while (index < trimmed.length && trimmed[index] === '#') {
    index += 1;
  }

  if (index > 0) {
    return trimmed.slice(index).trimStart();
  }

  if (trimmed.startsWith('>')) {
    return trimmed.slice(1).trimStart();
  }

  if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('+ ')) {
    return trimmed.slice(2).trimStart();
  }

  return trimmed;
}

export function buildAnnouncementPreviewText(content: string): string {
  const normalizedContent = content
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n');

  const firstBlock = normalizedContent
    .split('\n\n')
    .map((block) => block.split('\n').map((line) => normalizeAnnouncementPreviewLine(line)).filter((line) => line.length > 0).join(' '))
    .find((block) => block.length > 0);

  if (firstBlock === undefined) {
    return '공지 내용을 입력하세요.';
  }

  return firstBlock.replace(/\s+/g, ' ').trim();
}

export function createBlankAnnouncement(): AnnouncementEditorSeed {
  const now = new Date().toISOString();
  const endAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  return {
    title: '',
    category: 'NOTICE',
    audience: 'ALL',
    channel: 'IN_APP',
    priority: 'NORMAL',
    pinned: false,
    publishedAt: '',
    startAt: now,
    endAt,
    content: '',
    isPublished: false,
  };
}

export function toAnnouncementEditorSeed(announcement: AnnouncementPageItem): AnnouncementEditorSeed {
  return {
    id: announcement.id,
    title: announcement.title,
    category: announcement.category,
    audience: announcement.audience,
    channel: announcement.channel,
    priority: announcement.priority,
    pinned: announcement.pinned,
    publishedAt: announcement.publishedAt ?? '',
    startAt: announcement.startAt ?? '',
    endAt: announcement.endAt ?? '',
    content: announcement.content,
    isPublished: announcement.isPublished,
  };
}

export function toEditorState(announcement: AnnouncementEditorSeed): AnnouncementEditorState {
  return {
    title: announcement.title,
    category: announcement.category,
    audience: normalizeEditorAudience(announcement.audience),
    priority: announcement.priority,
    isPublished: announcement.isPublished ?? Boolean(announcement.publishedAt),
    startAt: toDateTimeInputValue(announcement.startAt),
    endAt: toDateTimeInputValue(announcement.endAt),
    content: announcement.content,
  };
}

export function buildCreateAnnouncementDto(
  original: AnnouncementEditorSeed,
  state: AnnouncementEditorState,
): CreateAnnouncementRequestDto {
  const content = state.content.trim();

  return {
    title: state.title.trim(),
    content,
    category: state.category,
    audience: state.audience,
    channel: original.channel,
    priority: state.priority,
    pinned: original.pinned,
    publishedAt: state.isPublished
      ? (original.publishedAt || new Date().toISOString())
      : undefined,
    startAt: fromDateTimeInputValue(state.startAt) || undefined,
    endAt: fromDateTimeInputValue(state.endAt) || undefined,
  };
}

export function buildUpdateAnnouncementDto(
  original: AnnouncementEditorSeed,
  state: AnnouncementEditorState,
): UpdateAnnouncementRequestDto {
  return {
    id: original.id ?? '',
    title: state.title.trim(),
    content: state.content.trim(),
    category: state.category,
    audience: state.audience,
    channel: original.channel,
    priority: state.priority,
    isPublished: state.isPublished,
    pinned: original.pinned,
    publishedAt: state.isPublished
      ? (original.publishedAt || new Date().toISOString())
      : undefined,
    startAt: fromDateTimeInputValue(state.startAt) || undefined,
    endAt: fromDateTimeInputValue(state.endAt) || undefined,
  };
}
