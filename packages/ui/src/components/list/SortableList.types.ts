import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';

export interface SortableListItem {
  id: string
  disabled?: boolean
}

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

export type SortableListRenderItem<T> = (
  args: SortableListRenderItemArgs<T>,
) => ReactNode;

export type SortableListRenderEmpty = () => ReactNode;

export type SortableListChangeHandler<T> = (
  nextValue: (SortableListItem & T)[],
) => void;

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

export type SortableListProps<T>
  = & Omit<ComponentPropsWithoutRef<'div'>, 'value' | 'defaultValue' | 'onChange' | 'children'>
    & SortableListRenderProps<T>
    & SortableListValueProps<T>;
