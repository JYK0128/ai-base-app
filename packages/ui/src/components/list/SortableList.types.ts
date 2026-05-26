import type { ComponentPropsWithoutRef, Dispatch, ReactNode, SetStateAction } from 'react';

export interface SortableListItem {
  id: string
  disabled?: boolean
}

export interface SortableListProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  value: SortableListItem[]
  onChange: Dispatch<SetStateAction<SortableListItem[]>>
  className?: string
  children?: ReactNode
}

export interface SortableListItemProps extends ComponentPropsWithoutRef<'div'> {
  id: string
  children?: ReactNode
  className?: string
}

export interface SortableListNoContentProps {
  children?: ReactNode
}

export interface SortableListContextValue {
  value: SortableListItem[]
  groupId: string
}

export interface SortableListItemContextValue {
  handleRef: (element: HTMLElement | null) => void
  isDragging: boolean
  isDropTarget: boolean
  disabled: boolean
}
