import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import type { TreeNode,
              TreeNodeDropPosition,
              TreeNodeMoveInput,
              TreeNodeMoveResult } from '@/lib/tree';

// ===========================================================================
// 1. 기초 및 DND 기본 데이터 구조
// ===========================================================================

export interface SortableTreeMove<T> extends TreeNodeMoveResult<T> {
  readonly previousRoot: TreeNode<T>
}

// ===========================================================================
// 2. Render 함수 및 상태/인자 관련 명세 (Top-Down 선언)
// ===========================================================================

export interface SortableTreeRenderNodeState {
  readonly isExpanded: boolean
  readonly isDragging: boolean
  readonly isDropTarget: boolean
  readonly isDisabled: boolean
}

export interface SortableTreeRenderNodeArgs<T> {
  readonly node: TreeNode<T>
  readonly depth: number
  readonly state: SortableTreeRenderNodeState
}

export type SortableTreeRenderNode<T> = (args: SortableTreeRenderNodeArgs<T>) => ReactNode;

export interface SortableTreeRenderDropState {
  readonly isOver: boolean
  readonly isDropAllowed: boolean
  readonly isDragging: boolean
}

export interface SortableTreeRenderDropIndicatorArgs {
  readonly targetId: string
  readonly position: Exclude<TreeNodeDropPosition, 'inside'>
  readonly depth: number
  readonly state: SortableTreeRenderDropState
}

export type SortableTreeRenderDropIndicator = (
  args: SortableTreeRenderDropIndicatorArgs,
) => ReactNode;

export interface SortableTreeRenderEmptyArgs<T> {
  readonly root: TreeNode<T>
}

export type SortableTreeRenderEmpty<T> = (
  args: SortableTreeRenderEmptyArgs<T>,
) => ReactNode;

// ===========================================================================
// 3. 컴포넌트 Props 및 제어부 명세
// ===========================================================================

export type SortableTreeBaseProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'onChange' | 'role' | 'defaultValue'
>;

export type SortableTreeChangeHandler<T> = (
  nextValue: TreeNode<T>,
  move: SortableTreeMove<T>,
) => void;

export type SortableTreeExpandedIdsChangeHandler = (expandedIds: string[]) => void;

export type SortableTreeNodeDisabledResolver<T> = (node: TreeNode<T>) => boolean;

export type SortableTreeCanDropHandler<T> = (move: SortableTreeMove<T>) => boolean;

export interface SortableTreeRenderProps<T> {
  readonly renderNode?: SortableTreeRenderNode<T>
  readonly renderDropIndicator?: SortableTreeRenderDropIndicator
  readonly renderEmpty?: SortableTreeRenderEmpty<T>
}

export interface SortableTreeBehaviorProps<T> {
  readonly getNodeDisabled?: SortableTreeNodeDisabledResolver<T>
  readonly canDrop?: SortableTreeCanDropHandler<T>
  readonly indentationWidth?: number
}

export type SortableTreeExpandedStateProps
  = | {
    readonly expandedIds: readonly string[]
    readonly defaultExpandedIds?: never
    readonly onExpandedIdsChange: SortableTreeExpandedIdsChangeHandler
  }
  | {
    readonly expandedIds?: never
    readonly defaultExpandedIds?: readonly string[]
    readonly onExpandedIdsChange?: SortableTreeExpandedIdsChangeHandler
  };

export type SortableTreeValueProps<T>
  = | {
    readonly value: TreeNode<T>
    readonly defaultValue?: never
    readonly onChange: SortableTreeChangeHandler<T>
  }
  | {
    readonly value?: never
    readonly defaultValue: TreeNode<T>
    readonly onChange?: SortableTreeChangeHandler<T>
  };

export type SortableTreeProps<T>
  = & SortableTreeBaseProps
    & SortableTreeRenderProps<T>
    & SortableTreeBehaviorProps<T>
    & SortableTreeExpandedStateProps
    & SortableTreeValueProps<T>;

// ===========================================================================
// 4. DND 및 내부 계산 전용 데이터 구조
// ===========================================================================

export interface TreeNodeDropTargetData {
  readonly type: 'tree-node'
  readonly nodeId: string
  readonly parentId: string
}

export interface TreeDropZoneData {
  readonly type: 'tree-drop-zone'
  readonly targetId: string
  readonly position: TreeNodeDropPosition
}

export type TreeDropTargetData = TreeNodeDropTargetData | TreeDropZoneData;

export interface SortableTreeVisibleItem<T> {
  readonly node: TreeNode<T>
  readonly parentId: string
  readonly depth: number
  readonly index: number
}

export type SortableTreeDropMoveResolver<T> = (
  targetId: string,
  position: TreeNodeDropPosition,
) => SortableTreeMove<T> | undefined;

export interface SortableTreeDropZoneState {
  readonly id: string
  readonly isOver: boolean
  readonly isDropAllowed: boolean
  readonly setNodeRef: (element: HTMLElement | null) => void
}

export type SortableTreeResolvedRenderProps<T> = {
  readonly [K in keyof SortableTreeRenderProps<T>]-?: NonNullable<SortableTreeRenderProps<T>[K]>
};

export type SortableTreeResolvedBehaviorProps<T> = {
  readonly [K in keyof Pick<
    SortableTreeBehaviorProps<T>,
    'getNodeDisabled' | 'indentationWidth'
  >]-?: NonNullable<SortableTreeBehaviorProps<T>[K]>
};

// ===========================================================================
// 5. 내부 컴포넌트 전용 Props 명세
// ===========================================================================

export type SortableTreeViewportProps<T>
  = & SortableTreeBaseProps
    & SortableTreeResolvedRenderProps<T>
    & SortableTreeResolvedBehaviorProps<T>
    & {
      readonly value: TreeNode<T>
      readonly expandedIdSet: ReadonlySet<string>
      readonly toggleExpanded: (nodeId: string) => void
      readonly resolveMove: (input: TreeNodeMoveInput) => SortableTreeMove<T> | undefined
    };

export type SortableTreeNodeRowProps<T>
  = & Pick<
    SortableTreeViewportProps<T>,
    | 'getNodeDisabled'
    | 'indentationWidth'
    | 'renderDropIndicator'
    | 'renderNode'
    | 'toggleExpanded'
  >
  & {
    readonly item: SortableTreeVisibleItem<T>
    readonly sortableGroupId: string
    readonly isDragging: boolean
    readonly isExpanded: boolean
    readonly resolveDropMove: SortableTreeDropMoveResolver<T>
    readonly showAfterIndicator: boolean
  };

export type SortableTreeDropIndicatorProps<T>
  = & Pick<
    SortableTreeNodeRowProps<T>,
    | 'indentationWidth'
    | 'isDragging'
    | 'renderDropIndicator'
    | 'resolveDropMove'
  >
  & Pick<
    SortableTreeRenderDropIndicatorArgs,
    | 'depth'
    | 'position'
    | 'targetId'
  >;

export type SortableTreeDragOverlayNodeProps<T>
  = & Pick<
    SortableTreeViewportProps<T>,
    | 'expandedIdSet'
    | 'getNodeDisabled'
    | 'indentationWidth'
    | 'renderNode'
  >
  & {
    readonly node: TreeNode<T>
    readonly depth: number
  };

// ===========================================================================
// 6. 훅 전용 타입 명세
// ===========================================================================

export interface UseSortableTreeMoveControllerArgs<T> {
  readonly value: TreeNode<T>
  readonly canDrop?: (move: SortableTreeMove<T>) => boolean
  readonly setValue: (nextValue: TreeNode<T>, move: SortableTreeMove<T>) => void
  readonly setNodeExpanded: (nodeId: string, expanded: boolean) => void
}

export interface UseSortableTreeExpandedNodeIdsArgs<T> {
  readonly root: TreeNode<T>
  readonly expandedIds?: readonly string[]
  readonly defaultExpandedIds?: readonly string[]
  readonly onExpandedIdsChange?: SortableTreeExpandedIdsChangeHandler
}

export interface UseSortableTreeDropMoveResolverArgs<T> {
  readonly activeSourceId: string | null
  readonly rootId: string
  readonly visibleItems: readonly SortableTreeVisibleItem<T>[]
  readonly resolveMove: (input: TreeNodeMoveInput) => SortableTreeMove<T> | undefined
}

export interface UseSortableTreeDropZoneArgs<T> {
  readonly resolveDropMove: SortableTreeDropMoveResolver<T>
  readonly targetId: string
  readonly position: TreeNodeDropPosition
}
