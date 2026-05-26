'use client';

import { arrayMove, move } from '@dnd-kit/helpers';
import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { isSortable, isSortableOperation, useSortable } from '@dnd-kit/react/sortable';
import { GripVertical } from 'lucide-react';
import * as React from 'react';

import type {
  SortableListContextValue,
  SortableListItem,
  SortableListItemProps,
  SortableListNoContentProps,
  SortableListProps,
} from './SortableList.types';

export type {
  SortableListItem,
  SortableListItemProps,
  SortableListNoContentProps,
  SortableListProps,
};

const SortableListContext
  = React.createContext<SortableListContextValue | null>(null);

function useSortableListContext() {
  const context = React.useContext(SortableListContext);

  if (!context) {
    throw new Error('SortableList.Item must be used within SortableList.');
  }

  return context;
}

function SortableListItem({
  id,
  children,
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

  return (
    <div
      role="listitem"
      className={item.disabled ? 'opacity-60' : undefined}
    >
      <div
        ref={sortableRef}
        className={
          isDragging || isDropTarget
            ? 'flex items-center gap-2 opacity-80 touch-none'
            : 'flex items-center gap-2 touch-none'
        }
      >
        <button
          ref={sortableHandleRef}
          type="button"
          aria-label={`Drag ${item.id}`}
          className="inline-flex size-8 shrink-0 items-center justify-center cursor-grab select-none touch-none active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
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

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) {
          return;
        }

        const { source, target } = event.operation;
        if (!source || !target) {
          return;
        }

        if (target.id === droppableId) {
          if (!isSortable(source)) {
            return;
          }

          onChange((current) => {
            const lastIndex = current.length - 1;
            if (lastIndex < 0 || source.initialIndex === lastIndex) {
              return current;
            }

            return arrayMove(current, source.initialIndex, lastIndex);
          });
          return;
        }

        if (!isSortableOperation(event.operation)) {
          return;
        }

        onChange((current) => move(current, event));
      }}
    >
      <SortableListContext.Provider value={contextValue}>
        <div ref={rootDropRef} role="list" aria-label="Sortable list editor" className={className}>
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
  NoContent: typeof SortableListNoContent
}

const SortableListCompound = Object.assign(SortableList, {
  Item: SortableListItem,
  NoContent: SortableListNoContent,
}) as SortableListCompound;

export { SortableListCompound as SortableList };
