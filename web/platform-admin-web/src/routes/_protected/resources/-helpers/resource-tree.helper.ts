import { type GetResourceListItem, GetResourceListItemType } from '@/api/generated/model';

export interface ResourceRow extends GetResourceListItem {
  readonly depth: number
}

export function flattenResourceTree(nodes: readonly GetResourceListItem[], depth = 0): ResourceRow[] {
  return nodes.flatMap((node) => ([
    { ...node, depth },
    ...flattenResourceTree(node.children ?? [], depth + 1),
  ]));
}

export function resourceTypeTone(type: GetResourceListItemType) {
  if (type === GetResourceListItemType.MENU) {
    return 'border-slate-200 bg-slate-100 text-slate-600';
  }

  return 'border-indigo-200 bg-indigo-50 text-indigo-700';
}
