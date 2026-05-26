'use client';

import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { GripVertical } from 'lucide-react';
import * as React from 'react';

import { SortableListContext,
         SortableListItemContext,
         useSortableListContext,
         useSortableListHandlers,
         useSortableListItemContext } from './SortableList.hooks';
import type { SortableListItem,
              SortableListItemProps,
              SortableListItemContextValue,
              SortableListNoContentProps,
              SortableListProps } from './SortableList.types';

export type { SortableListItem,
  SortableListItemProps,
  SortableListNoContentProps,
  SortableListProps };

function SortableListItem({
  id,
  children,
  className,
  ...props
}: Readonly<SortableListItemProps>) {
  const { value, groupId } = useSortableListContext();
  const index = value.findIndex((item) => item.id === id);
  const item = index >= 0 ? value[index] : undefined;
  const {
    ref: sortableRef,
    handleRef: sortableHandleRef,
    isDragging,
    isDropTarget,
  } = useSortable({
    id,
    index: index >= 0 ? index : 0,
    group: groupId,
    disabled: item?.disabled ?? false,
  });

  if (!item) {
    return null;
  }

  const contextValue: SortableListItemContextValue = {
    handleRef: sortableHandleRef,
    isDragging,
    isDropTarget,
    disabled: item.disabled ?? false,
  };

  return (
    <SortableListItemContext.Provider value={contextValue}>
      <div
        ref={sortableRef}
        role="listitem"
        className={className}
        style={{
          opacity: isDragging ? 0.4 : 1,
          ...props.style,
        }}
        {...props}
      >
        {children}
      </div>
    </SortableListItemContext.Provider>
  );
}

function SortableListDragHandle({
  children,
  className,
  ...props
}: Readonly<React.ComponentPropsWithoutRef<'button'>>) {
  const { handleRef, disabled } = useSortableListItemContext();

  return (
    <button
      ref={handleRef}
      type="button"
      disabled={disabled}
      aria-label="Drag item to reorder"
      className={className ?? 'inline-flex size-8 shrink-0 items-center justify-center cursor-grab select-none touch-none active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50'}
      {...props}
    >
      {children ?? <GripVertical className="size-4" />}
    </button>
  );
}

function SortableListNoContent({
  children,
}: Readonly<SortableListNoContentProps>) {
  return children ? <>{children}</> : null;
}

function SortableList({
  value,
  onChange,
  className,
  children,
  ...props
}: Readonly<SortableListProps>) {
  const instanceId = React.useId().replaceAll(':', '');
  const groupId = `__sortable-list-group__${instanceId}`;
  const droppableId = `__sortable-list-dropzone__${instanceId}`;
  const { ref: rootDropRef } = useDroppable({
    id: droppableId,
  });
  const contextValue = {
    value,
    groupId,
  };
  const emptyContent = React.useMemo(() => {
    const slots: React.ReactNode[] = [];

    React.Children.forEach(children, (child) => {
      if (
        React.isValidElement<SortableListNoContentProps>(child)
        && child.type === SortableListNoContent
      ) {
        slots.push(child.props.children);
      }
    });

    if (slots.length === 0) {
      return null;
    }

    return slots;
  }, [children]);
  let emptyStateNode: React.ReactNode = null;
  if (emptyContent) {
    emptyStateNode = (
      <div className="py-4">
        {emptyContent}
      </div>
    );
  }

  const { handleDragEnd } = useSortableListHandlers({
    onChange,
    droppableId,
  });

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <SortableListContext.Provider value={contextValue}>
        <div
          ref={rootDropRef}
          role="list"
          aria-label="Sortable list editor"
          className={className}
          {...props}
        >
          {value.length > 0
            ? (
              <div className="space-y-2">{children}</div>
            )
            : emptyStateNode}
        </div>
      </SortableListContext.Provider>
    </DragDropProvider>
  );
}

interface SortableListCompound extends React.FC<SortableListProps> {
  Item: typeof SortableListItem
  DragHandle: typeof SortableListDragHandle
  NoContent: typeof SortableListNoContent
}

const SortableListCompound = Object.assign(SortableList, {
  Item: SortableListItem,
  DragHandle: SortableListDragHandle,
  NoContent: SortableListNoContent,
}) as SortableListCompound;

export { SortableListCompound as SortableList };
