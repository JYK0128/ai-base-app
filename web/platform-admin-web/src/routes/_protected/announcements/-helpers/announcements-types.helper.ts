import type { AnnouncementPageItemAudience, AnnouncementPageItemCategory, AnnouncementPageItemPriority, AnnouncementPageItemStatus } from '@/api/generated/model';

export interface AnnouncementEditorSeed {
  id?: string
  title: string
  category: AnnouncementPageItemCategory
  audience: AnnouncementPageItemAudience
  priority: AnnouncementPageItemPriority
  pinned: boolean
  publishedAt: string
  startAt: string
  endAt: string
  content: string
  isPublished?: boolean
}

export interface AnnouncementEditorState {
  title: string
  category: AnnouncementPageItemCategory
  audience: AnnouncementPageItemAudience
  priority: AnnouncementPageItemPriority
  pinned: boolean
  isPublished: boolean
  startAt: string
  endAt: string
  content: string
}

export const ANNOUNCEMENT_CATEGORY_LABELS = {
  NOTICE: '공지',
  MAINTENANCE: '점검',
  SECURITY: '보안',
  EVENT: '이벤트',
} as const satisfies Record<AnnouncementPageItemCategory, string>;

export const ANNOUNCEMENT_AUDIENCE_LABELS = {
  ALL: '플랫폼 조직 전체',
  PLATFORM: '플랫폼 조직',
  ORGANIZATION: '일반 조직',
} as const satisfies Record<AnnouncementPageItemAudience, string>;

export const ANNOUNCEMENT_PRIORITY_LABELS = {
  LOW: '낮음',
  NORMAL: '보통',
  HIGH: '높음',
} as const satisfies Record<AnnouncementPageItemPriority, string>;

export const ANNOUNCEMENT_STATUS_LABELS = {
  DRAFT: '초안',
  SCHEDULED: '예약',
  ACTIVE: '게시',
  EXPIRED: '종료',
} as const satisfies Record<AnnouncementPageItemStatus, string>;
