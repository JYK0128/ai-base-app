import type { DragEndEvent } from '@dnd-kit/react';
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';

// ---------------------------------------------------------------------------
// 공개 입력 타입
// ---------------------------------------------------------------------------

export type SortableListBaseProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'value' | 'defaultValue' | 'onChange' | 'children'
>;

export interface SortableListItem {
  readonly id: string
  readonly disabled?: boolean
}

export type SortableListChangeHandler<T> = (
  nextValue: (SortableListItem & T)[],
) => void;

// ---------------------------------------------------------------------------
// render 함수 인자
// ---------------------------------------------------------------------------

export interface SortableListRenderItemState {
  readonly isDragging: boolean
  readonly isDropTarget: boolean
  readonly isDisabled: boolean
}

export interface SortableListDragHandleProps {
  readonly ref: (element: HTMLElement | null) => void
  readonly style: CSSProperties
}

export interface SortableListRenderItemArgs<T> {
  readonly item: SortableListItem & T
  readonly index: number
  readonly state: SortableListRenderItemState
  readonly dragHandleProps: SortableListDragHandleProps
  readonly ref: (element: HTMLElement | null) => void
}

// ---------------------------------------------------------------------------
// 공개 입력 타입 (계속)
// ---------------------------------------------------------------------------

export type SortableListRenderItem<T> = (
  args: SortableListRenderItemArgs<T>,
) => ReactNode;

export type SortableListRenderEmpty = () => ReactNode;

export interface SortableListRenderProps<T> {
  readonly renderItem?: SortableListRenderItem<T>
  readonly renderEmpty?: SortableListRenderEmpty
}

export type SortableListValueProps<T>
  = | {
    readonly value: (SortableListItem & T)[]
    readonly defaultValue?: never
    readonly onChange: SortableListChangeHandler<T>
  }
  | {
    readonly value?: never
    readonly defaultValue: (SortableListItem & T)[]
    readonly onChange?: SortableListChangeHandler<T>
  };

export type SortableListProps<T>
  = & SortableListBaseProps
    & SortableListRenderProps<T>
    & SortableListValueProps<T>;

// ---------------------------------------------------------------------------
// 내부 컴포넌트 props
// ---------------------------------------------------------------------------

export interface SortableListRowProps<T> {
  readonly item: SortableListItem & T
  readonly index: number
  readonly groupId: string
  readonly renderItem: SortableListRenderItem<T>
}

export type SortableListViewportProps<T>
  = & SortableListBaseProps
    & {
      readonly renderItem: SortableListRenderItem<T>
      readonly renderEmpty: SortableListRenderEmpty
    }
    & {
      readonly value: (SortableListItem & T)[]
      readonly groupId: string
      readonly droppableId: string
    };

// ---------------------------------------------------------------------------
// 훅 타입 명세
// ---------------------------------------------------------------------------

export interface UseSortableListHandlersArgs<T> {
  readonly value: (SortableListItem & T)[]
  readonly setValue: (next: (SortableListItem & T)[]) => void
  readonly droppableId: string
}

export interface UseSortableListHandlersResult {
  readonly handleDragEnd: (event: DragEndEvent) => void
}
