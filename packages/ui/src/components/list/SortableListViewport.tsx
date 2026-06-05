'use client';

import { useDroppable } from '@dnd-kit/react';

import type { SortableListViewportProps } from './SortableList.types';
import { SortableListRow } from './SortableListRow';

export function SortableListViewport<T>({
  value,
  groupId,
  droppableId,
  renderNode,
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
        ? value.map((node, index) => (
          <SortableListRow
            key={node.id}
            node={node}
            index={index}
            groupId={groupId}
            renderNode={renderNode}
          />
        ))
        : renderEmpty?.()}
    </div>
  );
}
