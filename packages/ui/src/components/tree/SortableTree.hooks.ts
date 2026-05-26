import { type DragEndEvent, useDroppable } from '@dnd-kit/react';
import * as React from 'react';

import { moveTreeNode,
         type TreeNode,
         type TreeNodeDropPosition,
         type TreeNodeMoveInput } from '@/lib/tree';

import type { SortableTreeChangeHandler,
              SortableTreeDropMoveResolver,
              SortableTreeDropZoneState,
              SortableTreeExpandedIdsChangeHandler,
              SortableTreeMove,
              SortableTreeVisibleItem,
              TreeDropTargetData,
              TreeDropZoneData } from './SortableTree.types';
import { collectNodeIdsWithChildren,
         createDropZoneId,
         TREE_DROP_POSITIONS } from './SortableTree.utils';

/**
 * value가 있으면 외부 상태를 쓰고, defaultValue만 있으면 내부 상태를 갱신한다.
 */
export function useSortableTreeValue<T>(
  controlledValue: TreeNode<T> | undefined,
  defaultValue: TreeNode<T> | undefined,
  onChange: SortableTreeChangeHandler<T> | undefined,
) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<TreeNode<T>>(() => {
    const initialValue = defaultValue ?? controlledValue;

    if (!initialValue) {
      throw new Error('SortableTree requires either value or defaultValue.');
    }

    return initialValue;
  });
  const isControlled = controlledValue !== undefined;
  const value = controlledValue ?? uncontrolledValue;
  const setValue = React.useCallback((nextValue: TreeNode<T>, move: SortableTreeMove<T>) => {
    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }

    onChange?.(nextValue, move);
  }, [isControlled, onChange]);

  return [value, setValue] as const;
}

/**
 * 드래그 종료 이벤트를 해석하고, 실제 트리 이동과 접힘/펼침 갱신을 연결한다.
 */
export function useSortableTreeMoveController<T>({
  value,
  canDrop,
  setValue,
  setNodeExpanded,
}: {
  readonly value: TreeNode<T>
  readonly canDrop?: (move: SortableTreeMove<T>) => boolean
  readonly setValue: (nextValue: TreeNode<T>, move: SortableTreeMove<T>) => void
  readonly setNodeExpanded: (nodeId: string, expanded: boolean) => void
}) {
  const resolveMove = React.useCallback((input: TreeNodeMoveInput): SortableTreeMove<T> | undefined => {
    const result = moveTreeNode(value, input);

    if (!result) {
      return undefined;
    }

    const move = {
      ...result,
      previousRoot: value,
    };

    if (canDrop && !canDrop(move)) {
      return undefined;
    }

    return move;
  }, [canDrop, value]);
  const handleDragEnd = React.useCallback((event: DragEndEvent) => {
    if (event.canceled) {
      return;
    }

    const sourceIdValue = event.operation.source?.id;
    const sourceId = sourceIdValue === undefined ? undefined : String(sourceIdValue);
    if (!sourceId) {
      return;
    }

    const targetData = event.operation.target?.data as TreeDropTargetData | undefined;
    if (!targetData) {
      return;
    }

    const dropTarget = targetData.type === 'tree-drop-zone'
      ? {
        targetId: targetData.targetId,
        position: targetData.position,
      }
      : {
        targetId: targetData.nodeId,
        position: 'inside' as const,
      };

    const move = resolveMove({
      sourceId,
      targetId: dropTarget.targetId,
      position: dropTarget.position,
    });

    if (!move) {
      return;
    }

    if (dropTarget.position === 'inside' && dropTarget.targetId !== value.id) {
      setNodeExpanded(dropTarget.targetId, true);
    }

    setValue(move.root, move);
  }, [resolveMove, setNodeExpanded, setValue, value.id]);

  return {
    handleDragEnd,
    resolveMove,
  } as const;
}

/**
 * 확장 상태를 controlled/uncontrolled 양쪽 방식으로 관리한다.
 */
export function useSortableTreeExpandedNodeIds<T>({
  root,
  expandedIds,
  defaultExpandedIds,
  onExpandedIdsChange,
}: {
  readonly root: TreeNode<T>
  readonly expandedIds?: readonly string[]
  readonly defaultExpandedIds?: readonly string[]
  readonly onExpandedIdsChange?: SortableTreeExpandedIdsChangeHandler
}) {
  const [uncontrolledExpandedIds, setUncontrolledExpandedIds] = React.useState<string[]>(() => [
    ...(defaultExpandedIds ?? collectNodeIdsWithChildren(root)),
  ]);
  const expandedIdList = expandedIds ?? uncontrolledExpandedIds;
  const expandedIdSet = React.useMemo(() => new Set(expandedIdList), [expandedIdList]);
  const updateExpandedIds = React.useCallback((nextIds: string[]) => {
    if (expandedIds === undefined) {
      setUncontrolledExpandedIds(nextIds);
    }

    onExpandedIdsChange?.(nextIds);
  }, [expandedIds, onExpandedIdsChange]);
  const setNodeExpanded = React.useCallback((nodeId: string, expanded: boolean) => {
    const nextIds = new Set(expandedIdSet);

    if (expanded) {
      nextIds.add(nodeId);
    }
    else {
      nextIds.delete(nodeId);
    }

    updateExpandedIds([...nextIds]);
  }, [expandedIdSet, updateExpandedIds]);
  const toggleExpanded = React.useCallback((nodeId: string) => {
    setNodeExpanded(nodeId, !expandedIdSet.has(nodeId));
  }, [expandedIdSet, setNodeExpanded]);

  return {
    expandedIdSet,
    setNodeExpanded,
    toggleExpanded,
  };
}

/**
 * 현재 드래그에서 가능한 모든 드롭 결과를 미리 계산해 드롭존별로 빠르게 조회한다.
 */
export function useSortableTreeDropMoveResolver<T>({
  activeSourceId,
  rootId,
  visibleItems,
  resolveMove,
}: {
  readonly activeSourceId: string | null
  readonly rootId: string
  readonly visibleItems: readonly SortableTreeVisibleItem<T>[]
  readonly resolveMove: (input: TreeNodeMoveInput) => SortableTreeMove<T> | undefined
}): SortableTreeDropMoveResolver<T> {
  const moveByTargetId = React.useMemo(() => {
    const moves = new Map<string, Partial<Record<TreeNodeDropPosition, SortableTreeMove<T>>>>();

    if (!activeSourceId) {
      return moves;
    }

    for (const { node } of visibleItems) {
      for (const position of TREE_DROP_POSITIONS) {
        const move = resolveMove({
          sourceId: activeSourceId,
          targetId: node.id,
          position,
        });

        if (move) {
          const currentMoves = moves.get(node.id) ?? {};
          currentMoves[position] = move;
          moves.set(node.id, currentMoves);
        }
      }
    }

    const rootInsideMove = resolveMove({
      sourceId: activeSourceId,
      targetId: rootId,
      position: 'inside',
    });

    if (rootInsideMove) {
      const currentMoves = moves.get(rootId) ?? {};
      currentMoves.inside = rootInsideMove;
      moves.set(rootId, currentMoves);
    }

    return moves;
  }, [activeSourceId, resolveMove, rootId, visibleItems]);

  return React.useCallback(
    (targetId: string, position: TreeNodeDropPosition) => moveByTargetId.get(targetId)?.[position],
    [moveByTargetId],
  );
}

/**
 * 드롭존 id 생성, dnd-kit 등록, 현재 드롭 가능 여부 조회를 한곳에서 처리한다.
 */
export function useSortableTreeDropZone<T>({
  targetId,
  position,
  resolveDropMove,
}: {
  readonly resolveDropMove: SortableTreeDropMoveResolver<T>
  readonly targetId: string
  readonly position: TreeNodeDropPosition
}): SortableTreeDropZoneState {
  const id = createDropZoneId(targetId, position);
  const isDropAllowed = Boolean(resolveDropMove(targetId, position));
  const { isDropTarget, ref } = useDroppable<TreeDropZoneData>({
    id,
    data: {
      type: 'tree-drop-zone',
      targetId,
      position,
    },
  });

  return {
    id,
    isOver: isDropTarget,
    isDropAllowed,
    setNodeRef: ref,
  };
}
