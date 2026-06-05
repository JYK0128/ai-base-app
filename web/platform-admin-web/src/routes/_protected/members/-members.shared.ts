import type { MemberResponseDtoRole } from '../../../api/model';

type RoleMeta = {
  label: string
  badgeClassName: string
};

export const ROLE_META = {
  OWNER: {
    label: 'Owner',
    badgeClassName: 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-50',
  },
  MANAGER: {
    label: 'Member',
    badgeClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50',
  },
  VIEWER: {
    label: 'Viewer',
    badgeClassName: 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100',
  },
} as const satisfies Record<MemberResponseDtoRole, RoleMeta>;

export const ROLE_OPTIONS = (['OWNER', 'MANAGER', 'VIEWER'] as const).map((value) => ({
  value,
  ...ROLE_META[value],
})) satisfies readonly {
  value: MemberResponseDtoRole
  label: string
  badgeClassName: string
}[];

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter((part): part is string => !!part)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function upsertById<T extends { id: string }>(
  items: readonly T[] | undefined,
  nextItem: T,
): T[] {
  const current = items ?? [];
  const index = current.findIndex((item) => item.id === nextItem.id);

  if (index === -1) {
    return [nextItem, ...current];
  }

  const next = [...current];
  next[index] = nextItem;
  return next;
}
