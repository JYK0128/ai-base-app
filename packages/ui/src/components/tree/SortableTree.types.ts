import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import type { TreeNode,
              TreeNodeDropPosition,
              TreeNodeMoveInput,
              TreeNodeMoveResult } from '@/lib/tree';

// ---------------------------------------------------------------------------
// 공개 입력 타입
// ---------------------------------------------------------------------------

export type SortableTreeBaseProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'onChange' | 'role' | 'defaultValue'
>;

export interface SortableTreeMove<T> extends TreeNodeMoveResult<T> {
  readonly previousRoot: TreeNode<T>
}

export type SortableTreeChangeHandler<T> = (
  nextValue: TreeNode<T>,
  move: SortableTreeMove<T>,
) => void;

export type SortableTreeExpandedIdsChangeHandler = (expandedIds: string[]) => void;

export type SortableTreeRenderNode<T> = (args: SortableTreeRenderNodeArgs<T>) => ReactNode;

export type SortableTreeRenderDropIndicator = (
  args: SortableTreeRenderDropIndicatorArgs,
) => ReactNode;

export type SortableTreeRenderEmpty<T> = (
  args: SortableTreeRenderEmptyArgs<T>,
) => ReactNode;

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

// ---------------------------------------------------------------------------
// render 함수 인자
// ---------------------------------------------------------------------------

/**
 * renderNode에서 스타일 분기에만 쓰는 노드 상태다.
 * DND ref나 버튼 이벤트 같은 DOM 연결은 SortableTreeNodeRow 내부에서 처리한다.
 */
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

/**
 * drop indicator가 드래그 상태에 따라 UI를 바꿀 때 쓰는 상태다.
 */
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

export interface SortableTreeRenderEmptyArgs<T> {
  readonly root: TreeNode<T>
}

// ---------------------------------------------------------------------------
// DND 메타데이터
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// 내부 계산 타입
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// 내부 컴포넌트 props
// ---------------------------------------------------------------------------

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
