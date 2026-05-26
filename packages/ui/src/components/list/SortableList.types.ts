import type { DragEndEvent } from '@dnd-kit/react';
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';

// ===========================================================================
// 1. 기초 및 DND 기본 데이터 구조
// ===========================================================================

export interface SortableListItem {
  readonly id: string
  readonly disabled?: boolean
}

// ===========================================================================
// 2. Render 함수 및 상태/인자 관련 명세 (Top-Down 선언)
// ===========================================================================

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

export type SortableListRenderItem<T> = (
  args: SortableListRenderItemArgs<T>,
) => ReactNode;

export type SortableListRenderEmpty = () => ReactNode;

// ===========================================================================
// 3. 컴포넌트 Props 및 제어부 명세
// ===========================================================================

export type SortableListBaseProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'value' | 'defaultValue' | 'onChange' | 'children'
>;

export type SortableListChangeHandler<T> = (
  nextValue: (SortableListItem & T)[],
) => void;

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

// ===========================================================================
// 4. 내부 컴포넌트 전용 Props 명세
// ===========================================================================

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

// ===========================================================================
// 5. 훅 전용 타입 명세
// ===========================================================================

export interface UseSortableListHandlersArgs<T> {
  readonly value: (SortableListItem & T)[]
  readonly setValue: (next: (SortableListItem & T)[]) => void
  readonly droppableId: string
}

export interface UseSortableListHandlersResult {
  readonly handleDragEnd: (event: DragEndEvent) => void
}
