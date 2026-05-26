'use client';

import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import * as React from 'react';

import { useSortableListHandlers, useSortableListValue } from './SortableList.hooks';
import type { SortableListDndItemWrapperProps, SortableListDndProps } from './SortableList.types';

function SortableListDndItemWrapper<T>({
  item,
  index,
  groupId,
  renderItem,
}: SortableListDndItemWrapperProps<T>) {
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
    <div
      ref={sortableRef}
      role="listitem"
      style={{
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      {renderItem({
        item,
        index,
        state,
        dragHandleProps,
      })}
    </div>
  );
}

export function SortableListDnd<T>({
  value: controlledValue,
  defaultValue,
  onChange,
  renderItem,
  renderEmpty,
  className,
  ...props
}: Readonly<SortableListDndProps<T>>) {
  const instanceId = React.useId().replaceAll(':', '');
  const groupId = `__sortable-list-group__${instanceId}`;
  const droppableId = `__sortable-list-dropzone__${instanceId}`;

  const { ref: rootDropRef } = useDroppable({
    id: droppableId,
  });

  const [value, setValue] = useSortableListValue(controlledValue, defaultValue, onChange);

  const { handleDragEnd } = useSortableListHandlers({
    value,
    setValue,
    droppableId,
  });

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div
        ref={rootDropRef}
        role="list"
        aria-label="Sortable list editor"
        className={className}
        {...props}
      >
        {value.length > 0
          ? (
            <div className="space-y-2">
              {value.map((item, index) => (
                <SortableListDndItemWrapper
                  key={item.id}
                  item={item}
                  index={index}
                  groupId={groupId}
                  renderItem={renderItem}
                />
              ))}
            </div>
          )
          : (
            renderEmpty?.()
          )}
      </div>
    </DragDropProvider>
  );
}
