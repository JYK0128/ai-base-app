import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';

// ---------------------------------------------------------------------------
// 공개 입력 타입
// ---------------------------------------------------------------------------

export type SortableListDndBaseProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'value' | 'defaultValue' | 'onChange' | 'children'
>;

export interface SortableListItem {
  readonly id: string
  readonly disabled?: boolean
}

export type SortableListDndChangeHandler<T> = (
  nextValue: (SortableListItem & T)[],
) => void;

export type SortableListRenderItem<T> = (
  args: SortableListDndRenderItemArgs<T>,
) => ReactNode;

export type SortableListRenderEmpty = () => ReactNode;

export interface SortableListRenderProps<T> {
  readonly renderItem: SortableListRenderItem<T>
  readonly renderEmpty?: SortableListRenderEmpty
}

export type SortableListValueProps<T>
  = | {
    readonly value: (SortableListItem & T)[]
    readonly defaultValue?: never
    readonly onChange: SortableListDndChangeHandler<T>
  }
  | {
    readonly value?: never
    readonly defaultValue: (SortableListItem & T)[]
    readonly onChange?: SortableListDndChangeHandler<T>
  };

export type SortableListDndProps<T>
  = & SortableListDndBaseProps
    & SortableListRenderProps<T>
    & SortableListValueProps<T>;

// ---------------------------------------------------------------------------
// render 함수 인자
// ---------------------------------------------------------------------------

export interface SortableListDndRenderItemState {
  readonly isDragging: boolean
  readonly isDropTarget: boolean
  readonly isDisabled: boolean
}

export interface SortableListDragHandleProps {
  readonly ref: (element: HTMLElement | null) => void
  readonly style: CSSProperties
}

export interface SortableListDndRenderItemArgs<T> {
  readonly item: SortableListItem & T
  readonly index: number
  readonly state: SortableListDndRenderItemState
  readonly dragHandleProps: SortableListDragHandleProps
  readonly ref: (element: HTMLElement | null) => void
}

// ---------------------------------------------------------------------------
// 내부 컴포넌트 props
// ---------------------------------------------------------------------------

export interface SortableListDndRowProps<T> {
  readonly item: SortableListItem & T
  readonly index: number
  readonly groupId: string
  readonly renderItem: SortableListRenderItem<T>
}

export type SortableListViewportProps<T>
  = & SortableListDndBaseProps
    & SortableListRenderProps<T>
    & {
      readonly value: (SortableListItem & T)[]
      readonly groupId: string
      readonly droppableId: string
    };
