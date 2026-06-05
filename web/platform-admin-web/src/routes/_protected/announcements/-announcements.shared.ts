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
  status: AnnouncementStatus
  pinned: boolean
  startAt: string
  endAt: string
  content: string
}

export interface AnnouncementEditorState {
  title: string
  category: AnnouncementCategory
  audience: AnnouncementAudience
  priority: AnnouncementPriority
  status: AnnouncementStatus
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

export function createBlankAnnouncement(): AnnouncementEditorSeed {
  const now = new Date().toISOString();
  const endAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  return {
    title: '',
    category: 'NOTICE',
    audience: 'ALL',
    channel: 'IN_APP',
    priority: 'NORMAL',
    status: 'DRAFT',
    pinned: false,
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
    status: announcement.status,
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
    status: state.status,
    pinned: original.pinned,
    startAt: fromDateTimeInputValue(state.startAt) || original.startAt,
    endAt: fromDateTimeInputValue(state.endAt) || original.endAt,
  };
}
