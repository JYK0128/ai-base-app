'use client';

import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import * as React from 'react';

import { useSortableListHandlers, useSortableListValue } from './SortableList.hooks';
import type { SortableListDndItemWrapperProps,
              SortableListDndProps,
              SortableListViewportProps } from './SortableList.types';

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

function SortableListViewport<T>({
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
          <SortableListDndItemWrapper
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

  const [value, setValue] = useSortableListValue(controlledValue, defaultValue, onChange);

  const { handleDragEnd } = useSortableListHandlers({
    value,
    setValue,
    droppableId,
  });

  const rootPropsWithAriaLabel = props['aria-label'] === undefined
    ? {
      ...props,
      'aria-label': 'Sortable list editor',
    }
    : props;

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <SortableListViewport
        value={value}
        groupId={groupId}
        droppableId={droppableId}
        renderItem={renderItem}
        renderEmpty={renderEmpty}
        className={className}
        {...rootPropsWithAriaLabel}
      />
    </DragDropProvider>
  );
}
