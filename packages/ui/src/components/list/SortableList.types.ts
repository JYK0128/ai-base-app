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

export type SortableListRenderItem<T> = (
  args: SortableListRenderItemArgs<T>,
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
    readonly onChange: SortableListChangeHandler<T>
  }
  | {
    readonly value?: never
    readonly defaultValue: (SortableListItem & T)[]
    readonly onChange?: SortableListChangeHandler<T>
  };

export type SortableListProps<T> =
  & SortableListBaseProps
  & SortableListRenderProps<T>
  & SortableListValueProps<T>;

// ---------------------------------------------------------------------------
// render 함수 인자
// ---------------------------------------------------------------------------

export interface SortableListItemState {
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
  readonly state: SortableListItemState
  readonly dragHandleProps: SortableListDragHandleProps
}

// ---------------------------------------------------------------------------
// 내부 컴포넌트 props
// ---------------------------------------------------------------------------

export interface SortableListItemWrapperProps<T> {
  readonly item: SortableListItem & T
  readonly index: number
  readonly groupId: string
  readonly renderItem: SortableListRenderItem<T>
}
