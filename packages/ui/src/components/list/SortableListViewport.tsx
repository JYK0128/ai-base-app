'use client';

import { useDroppable } from '@dnd-kit/react';

import type { SortableListViewportProps } from './SortableList.types';
import { SortableListRow } from './SortableListRow';

export function SortableListViewport<T>({
  value,
  groupId,
  droppableId,
  renderItem,
  renderEmpty,
  className,
  ...props
}: SortableListViewportProps<T>) {
  const { ref: rootDropRef } = useDroppable({
    id: droppableId,
  });

  return (
    <div
      ref={rootDropRef}
      role="list"
      className={className}
      {...props}
    >
      {value.length > 0
        ? value.map((item, index) => (
          <SortableListRow
            key={item.id}
            item={item}
            index={index}
            groupId={groupId}
            renderItem={renderItem}
          />
        ))
        : renderEmpty?.()}
    </div>
  );
}
