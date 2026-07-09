import { CreateResourceRequestDtoActionsItem as ResourceActionItem } from '@/api/generated/model';

export const RESOURCE_ACTION_OPTIONS = [
  ResourceActionItem.CREATE,
  ResourceActionItem.READ,
  ResourceActionItem.UPDATE,
  ResourceActionItem.DELETE,
] as const;

export type ResourceAction = (typeof RESOURCE_ACTION_OPTIONS)[number];

export const RESOURCE_ACTION_LABELS: Record<ResourceAction, string> = {
  CREATE: '추가',
  READ: '조회',
  UPDATE: '수정',
  DELETE: '삭제',
};
