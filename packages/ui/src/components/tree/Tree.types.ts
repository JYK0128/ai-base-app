import type { ComponentPropsWithoutRef,
              ReactNode } from 'react';

import type { TreeNode,
              TreeNodeDropPosition,
              TreeNodeMoveInput,
              TreeNodeMoveResult } from '@/lib/tree';

// ---------------------------------------------------------------------------
// 공개 입력 타입
// ---------------------------------------------------------------------------

export type TreeDndBaseProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'onChange' | 'role' | 'defaultValue'
>;

export interface TreeDndMove<T> extends TreeNodeMoveResult<T> {
  readonly previousRoot: TreeNode<T>
}

export type TreeDndChangeHandler<T> = (
  nextValue: TreeNode<T>,
  move: TreeDndMove<T>,
) => void;

export type TreeExpandedIdsChangeHandler = (expandedIds: string[]) => void;

export type TreeRenderNode<T> = (args: TreeDndRenderNodeArgs<T>) => ReactNode;

export type TreeRenderDropIndicator = (
  args: TreeDndRenderDropIndicatorArgs,
) => ReactNode;

export type TreeRenderEmpty<T> = (
  args: TreeDndRenderEmptyArgs<T>,
) => ReactNode;

export type TreeNodeDisabledResolver<T> = (node: TreeNode<T>) => boolean;

export type TreeCanDropHandler<T> = (move: TreeDndMove<T>) => boolean;

export interface TreeRenderProps<T> {
  readonly renderNode?: TreeRenderNode<T>
  readonly renderDropIndicator?: TreeRenderDropIndicator
  readonly renderEmpty?: TreeRenderEmpty<T>
}

export interface TreeBehaviorProps<T> {
  readonly getNodeDisabled?: TreeNodeDisabledResolver<T>
  readonly canDrop?: TreeCanDropHandler<T>
  readonly indentationWidth?: number
}

export type TreeExpandedStateProps
  = | {
    readonly expandedIds: readonly string[]
    readonly defaultExpandedIds?: never
    readonly onExpandedIdsChange: TreeExpandedIdsChangeHandler
  }
  | {
    readonly expandedIds?: never
    readonly defaultExpandedIds?: readonly string[]
    readonly onExpandedIdsChange?: TreeExpandedIdsChangeHandler
  };

export type TreeValueProps<T>
  = | {
    readonly value: TreeNode<T>
    readonly defaultValue?: never
    readonly onChange: TreeDndChangeHandler<T>
  }
  | {
    readonly value?: never
    readonly defaultValue: TreeNode<T>
    readonly onChange?: TreeDndChangeHandler<T>
  };

export type TreeDndProps<T>
  = & TreeDndBaseProps
    & TreeRenderProps<T>
    & TreeBehaviorProps<T>
    & TreeExpandedStateProps
    & TreeValueProps<T>;

// ---------------------------------------------------------------------------
// render 함수 인자
// ---------------------------------------------------------------------------

/**
 * renderNode에서 스타일 분기에만 쓰는 노드 상태다.
 * DND ref나 버튼 이벤트 같은 DOM 연결은 TreeNodeRow 내부에서 처리한다.
 */
export interface TreeDndRenderNodeState {
  readonly isExpanded: boolean
  readonly isDragging: boolean
  readonly isDropTarget: boolean
  readonly isDisabled: boolean
}

export interface TreeDndRenderNodeArgs<T> {
  readonly node: TreeNode<T>
  readonly depth: number
  readonly state: TreeDndRenderNodeState
}

/**
 * drop indicator가 드래그 상태에 따라 UI를 바꿀 때 쓰는 상태다.
 */
export interface TreeDndRenderDropState {
  readonly isOver: boolean
  readonly isDropAllowed: boolean
  readonly isDragging: boolean
}

export interface TreeDndRenderDropIndicatorArgs {
  readonly targetId: string
  readonly position: Exclude<TreeNodeDropPosition, 'inside'>
  readonly depth: number
  readonly state: TreeDndRenderDropState
}

export interface TreeDndRenderEmptyArgs<T> {
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

export interface TreeVisibleItem<T> {
  readonly node: TreeNode<T>
  readonly parentId: string
  readonly depth: number
  readonly index: number
}

export type TreeDropMoveResolver<T> = (
  targetId: string,
  position: TreeNodeDropPosition,
) => TreeDndMove<T> | undefined;

export type TreeResolvedRenderProps<T> = {
  readonly [K in keyof TreeRenderProps<T>]-?: NonNullable<TreeRenderProps<T>[K]>
};

export type TreeResolvedBehaviorProps<T> = {
  readonly [K in keyof Pick<
    TreeBehaviorProps<T>,
    'getNodeDisabled' | 'indentationWidth'
  >]-?: NonNullable<TreeBehaviorProps<T>[K]>
};

// ---------------------------------------------------------------------------
// 내부 컴포넌트 props
// ---------------------------------------------------------------------------

export type TreeViewportProps<T>
  = & TreeDndBaseProps
    & TreeResolvedRenderProps<T>
    & TreeResolvedBehaviorProps<T>
    & {
      readonly value: TreeNode<T>
      readonly expandedIdSet: ReadonlySet<string>
      readonly toggleExpanded: (nodeId: string) => void
      readonly resolveMove: (input: TreeNodeMoveInput) => TreeDndMove<T> | undefined
    };

export type TreeNodeRowProps<T>
  = & Pick<
    TreeViewportProps<T>,
    | 'getNodeDisabled'
    | 'indentationWidth'
    | 'renderDropIndicator'
    | 'renderNode'
    | 'toggleExpanded'
  >
  & {
    readonly item: TreeVisibleItem<T>
    readonly sortableGroupId: string
    readonly isDragging: boolean
    readonly isExpanded: boolean
    readonly resolveDropMove: TreeDropMoveResolver<T>
    readonly showAfterIndicator: boolean
  };

export type TreeDropIndicatorProps<T>
  = & Pick<
    TreeNodeRowProps<T>,
    | 'indentationWidth'
    | 'isDragging'
    | 'renderDropIndicator'
    | 'resolveDropMove'
  >
  & Pick<
    TreeDndRenderDropIndicatorArgs,
    | 'depth'
    | 'position'
    | 'targetId'
  >;

export type TreeDragOverlayNodeProps<T>
  = & Pick<
    TreeViewportProps<T>,
    | 'expandedIdSet'
    | 'getNodeDisabled'
    | 'indentationWidth'
    | 'renderNode'
  >
  & {
    readonly node: TreeNode<T>
    readonly depth: number
  };
