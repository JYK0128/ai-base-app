import type { TreeNode, TreeNodeDropPosition } from '@/lib/tree';

import type { TreeVisibleItem } from './Tree.types';

export const TREE_DROP_ZONE_PREFIX = '__tree_dnd_drop__';
export const TREE_DROP_POSITIONS = ['before', 'after', 'inside'] as const satisfies readonly TreeNodeDropPosition[];
export const DEFAULT_INDENT = 24;

/**
 * 기본값으로는 어떤 노드도 비활성화하지 않는다.
 * TreeDnd에서 `getNodeDisabled`를 따로 주지 않았을 때 쓰는 기본 함수다.
 */
export const getDefaultNodeDisabled = () => false;

/**
 * 노드의 화면 표시 이름을 결정한다.
 *
 * 우선순위는 다음과 같다.
 * 1. `node.value`가 문자열, 숫자, 불리언이면 그 값을 그대로 문자열로 변환한다.
 * 2. `node.value.label`이 문자열이면 그 값을 사용한다.
 * 3. 둘 다 아니면 `node.id`를 마지막 표시값으로 쓴다.
 *
 * @param node 라벨을 추론할 대상 노드.
 * @returns 화면에 보여줄 문자열 라벨.
 */
export function getDefaultNodeLabel<T>(node: TreeNode<T>): string {
  const { value } = node;

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value && typeof value === 'object' && 'label' in value) {
    const label = (value as { readonly label?: unknown }).label;

    if (typeof label === 'string') {
      return label;
    }
  }

  return node.id;
}

/**
 * 자식 노드 목록을 안전하게 읽는다.
 *
 * `children`이 없으면 `undefined`가 아니라 빈 배열을 돌려서,
 * 호출하는 쪽이 항상 배열 순회만 하도록 만든다.
 *
 * @param node 자식 목록을 읽을 대상 노드.
 * @returns 자식 노드 배열. 없으면 빈 배열.
 */
export function getNodeChildren<T>(node: TreeNode<T>): readonly TreeNode<T>[] {
  return node.children ?? [];
}

/**
 * 트리 전체에서 특정 id를 가진 노드를 찾는다.
 *
 * DFS 방식으로 현재 노드와 모든 자식을 재귀 탐색한다.
 * 드래그 시작 노드나 drop 대상 노드를 찾을 때 쓴다.
 *
 * @param node 탐색을 시작할 루트 노드.
 * @param targetId 찾고 싶은 노드 id.
 * @returns id가 일치하는 노드, 없으면 `undefined`.
 */
export function findNodeById<T>(
  node: TreeNode<T>,
  targetId: string,
): TreeNode<T> | undefined {
  if (node.id === targetId) {
    return node;
  }

  for (const child of getNodeChildren(node)) {
    const found = findNodeById(child, targetId);

    if (found) {
      return found;
    }
  }

  return undefined;
}

/**
 * 노드 자신과 모든 자식 노드의 id를 전부 모은다.
 *
 * 드래그 중 원본 서브트리를 화면에서 숨길 때 사용한다.
 *
 * @param node id를 수집할 서브트리의 루트 노드.
 * @returns 현재 노드와 모든 후손 노드의 id 배열.
 */
export function collectNodeAndDescendantIds<T>(node: TreeNode<T>): string[] {
  const ids: string[] = [node.id];

  for (const child of getNodeChildren(node)) {
    ids.push(...collectNodeAndDescendantIds(child));
  }

  return ids;
}

/**
 * 화면에 보이는 노드만 평평한 목록으로 만든다.
 *
 * `expandedIds`에 포함된 노드만 자식까지 재귀적으로 펼친다.
 * 각 항목에는 현재 깊이(`depth`)와 부모 id(`parentId`)가 같이 들어가서
 * 렌더링과 DND 판정을 단순하게 만든다.
 *
 * @param nodes 현재 레벨의 형제 노드 목록.
 * @param expandedIds 펼쳐진 노드 id 집합.
 * @param parentId 현재 `nodes`의 부모 노드 id.
 * @param depth 현재 깊이. 루트 자식은 0부터 시작한다.
 * @returns 렌더링에 쓸 평면 구조의 노드 목록.
 */
export function buildVisibleTreeItems<T>(
  nodes: readonly TreeNode<T>[],
  expandedIds: ReadonlySet<string>,
  parentId: string,
  depth = 0,
): TreeVisibleItem<T>[] {
  const visibleItems: TreeVisibleItem<T>[] = [];

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];

    visibleItems.push({
      node,
      parentId,
      depth,
      index,
    });

    if (expandedIds.has(node.id)) {
      visibleItems.push(...buildVisibleTreeItems(getNodeChildren(node), expandedIds, node.id, depth + 1));
    }
  }

  return visibleItems;
}

/**
 * 기본 펼침 상태로 사용할 id 목록을 만든다.
 *
 * 자식이 있는 노드만 골라서 반환한다. 리프 노드는 펼칠 수 없으므로 제외한다.
 *
 * @param root 전체 트리의 루트 노드.
 * @returns 자식이 하나 이상 있는 노드들의 id 배열.
 */
export function collectNodeIdsWithChildren<T>(root: TreeNode<T>): string[] {
  const ids: string[] = [];

  function visit(node: TreeNode<T>, includeCurrentNode: boolean) {
    const children = getNodeChildren(node);

    if (includeCurrentNode && children.length > 0) {
      ids.push(node.id);
    }

    for (const child of children) {
      visit(child, true);
    }
  }

  visit(root, false);
  return ids;
}

/**
 * target id와 drop 위치를 dnd-kit droppable id 문자열로 바꾼다.
 *
 * `before`, `after`, `inside` 같은 위치 정보를 문자열 하나로 합쳐서
 * 실제 droppable 요소의 식별자로 쓴다.
 *
 * @param targetId drop zone이 붙어 있는 대상 노드 id.
 * @param position 노드 앞/뒤/안쪽 중 어느 위치인지.
 * @returns dnd-kit이 사용할 수 있는 문자열 id.
 */
export function createDropZoneId(targetId: string, position: TreeNodeDropPosition): string {
  return `${TREE_DROP_ZONE_PREFIX}${position}:${targetId}`;
}
