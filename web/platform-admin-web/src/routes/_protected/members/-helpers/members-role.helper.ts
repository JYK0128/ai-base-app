import type { OrganizationRoleListItem } from '@/api/generated/model';

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
  EXTRA: {
    label: 'Extra',
    badgeClassName: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50',
  },
} as const satisfies Record<string, RoleMeta>;

export type MemberRole = keyof typeof ROLE_META;
export function getRoleMeta(role: string | null | undefined): RoleMeta {
  if (role && role in ROLE_META) {
    return ROLE_META[role as MemberRole];
  }

  return ROLE_META.EXTRA;
}

export function buildRoleOptions(roleItems: readonly OrganizationRoleListItem[]) {
  return roleItems.map((role) => ({
    id: role.id,
    value: role.code,
    label: role.name,
  }));
}
