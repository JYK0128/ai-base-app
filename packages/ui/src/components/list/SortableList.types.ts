import type { Dispatch, ReactNode, SetStateAction } from 'react';

export interface SortableListItem {
  id: string
  disabled?: boolean
}

export interface SortableListProps {
  value: SortableListItem[]
  onChange: Dispatch<SetStateAction<SortableListItem[]>>
  className?: string
  children?: ReactNode
}

export interface SortableListItemProps {
  id: string
  children?: ReactNode
}

export interface SortableListNoContentProps {
  children?: ReactNode
}

export interface SortableListContextValue {
  value: SortableListItem[]
  groupId: string
}
