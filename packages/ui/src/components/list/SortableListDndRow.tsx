'use client';

import { useSortable } from '@dnd-kit/react/sortable';
import * as React from 'react';

import type { SortableListDndRowProps } from './SortableList.types';

export function SortableListDndRow<T>({
  item,
  index,
  groupId,
  renderItem,
}: SortableListDndRowProps<T>) {
  const {
    ref: sortableRef,
    handleRef: sortableHandleRef,
    isDragging,
    isDropTarget,
  } = useSortable({
    id: item.id,
    index,
    group: groupId,
    disabled: item.disabled ?? false,
  });

  const state = {
    isDragging,
    isDropTarget,
    isDisabled: item.disabled ?? false,
  };

  const dragHandleProps = {
    ref: sortableHandleRef,
    style: {
      cursor: item.disabled ? 'not-allowed' : 'grab',
      touchAction: 'none',
    },
  };

  return (
    <>
      {renderItem({
        item,
        index,
        state,
        dragHandleProps,
        ref: sortableRef,
      })}
    </>
  );
}
