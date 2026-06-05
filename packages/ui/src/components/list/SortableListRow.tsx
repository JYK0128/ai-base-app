'use client';

import { useSortable } from '@dnd-kit/react/sortable';

import type { SortableListRowProps } from './SortableList.types';

export function SortableListRow<T>({
  node,
  index,
  groupId,
  renderNode,
}: SortableListRowProps<T>) {
  const {
    ref: sortableRef,
    handleRef: sortableHandleRef,
    isDragging,
    isDropTarget,
  } = useSortable({
    id: node.id,
    index,
    group: groupId,
    disabled: node.disabled ?? false,
  });

  const state = {
    isDragging,
    isDropTarget,
    isDisabled: node.disabled ?? false,
  };

  const dragHandleProps = {
    ref: sortableHandleRef,
    style: {
      cursor: node.disabled ? 'not-allowed' : 'grab',
      touchAction: 'none',
    },
  };

  return (
    <>
      {renderNode({
        node,
        index,
        state,
        dragHandleProps,
        ref: sortableRef,
      })}
    </>
  );
}
