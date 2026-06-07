import type { AnnouncementResponseDto, AnnouncementResponseDtoAudience, AnnouncementResponseDtoCategory, AnnouncementResponseDtoChannel, AnnouncementResponseDtoPriority, AnnouncementResponseDtoStatus, CreateAnnouncementDto } from '../../../api/model';

export type AnnouncementItem = AnnouncementResponseDto;
export type AnnouncementCategory = AnnouncementResponseDtoCategory;
export type AnnouncementAudience = AnnouncementResponseDtoAudience;
export type AnnouncementChannel = AnnouncementResponseDtoChannel;
export type AnnouncementPriority = AnnouncementResponseDtoPriority;
export type AnnouncementStatus = AnnouncementResponseDtoStatus;

export interface AnnouncementEditorSeed {
  id?: string
  title: string
  category: AnnouncementCategory
  audience: AnnouncementAudience
  channel: AnnouncementChannel
  priority: AnnouncementPriority
  pinned: boolean
  publishedAt: string
  startAt: string
  endAt: string
  content: string
}

export interface AnnouncementEditorState {
  title: string
  category: AnnouncementCategory
  audience: AnnouncementAudience
  priority: AnnouncementPriority
  publishedAt: string
  startAt: string
  endAt: string
  content: string
}

export const ANNOUNCEMENT_CATEGORY_LABELS = {
  NOTICE: '공지',
  MAINTENANCE: '점검',
  SECURITY: '보안',
  EVENT: '이벤트',
} as const satisfies Record<AnnouncementCategory, string>;

export const ANNOUNCEMENT_AUDIENCE_LABELS = {
  ALL: '전체 조직',
  PLATFORM: '플랫폼 조직',
  ORGANIZATION: '일반 조직',
} as const satisfies Record<AnnouncementAudience, string>;

export const ANNOUNCEMENT_CHANNEL_LABELS = {
  IN_APP: '앱 내 알림',
  EMAIL: '이메일',
  PUSH: '푸시 알림',
} as const satisfies Record<AnnouncementChannel, string>;

export const ANNOUNCEMENT_PRIORITY_LABELS = {
  LOW: '낮음',
  NORMAL: '보통',
  HIGH: '높음',
} as const satisfies Record<AnnouncementPriority, string>;

export const ANNOUNCEMENT_STATUS_LABELS = {
  DRAFT: '초안',
  PUBLISHED: '게시',
} as const satisfies Record<AnnouncementStatus, string>;

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
  };
}

export function toEditorState(announcement: AnnouncementEditorSeed): AnnouncementEditorState {
  return {
    title: announcement.title,
    category: announcement.category,
    audience: announcement.audience,
    priority: announcement.priority,
    publishedAt: toDateTimeInputValue(announcement.publishedAt),
    startAt: toDateTimeInputValue(announcement.startAt),
    endAt: toDateTimeInputValue(announcement.endAt),
    content: announcement.content,
  };
}

export function buildCreateAnnouncementDto(
  original: AnnouncementEditorSeed,
  state: AnnouncementEditorState,
): CreateAnnouncementDto {
  const content = state.content.trim();

  return {
    ...(original.id ? { id: original.id } : {}),
    title: state.title.trim(),
    content,
    category: state.category,
    audience: state.audience,
    channel: original.channel,
    priority: state.priority,
    pinned: original.pinned,
    publishedAt: fromDateTimeInputValue(state.publishedAt) || undefined,
    startAt: fromDateTimeInputValue(state.startAt) || undefined,
    endAt: fromDateTimeInputValue(state.endAt) || undefined,
  };
}
