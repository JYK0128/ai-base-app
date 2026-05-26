import { arrayMove, move } from '@dnd-kit/helpers';
import type { DragEndEvent } from '@dnd-kit/react';
import { isSortable, isSortableOperation } from '@dnd-kit/react/sortable';
import * as React from 'react';

import type { SortableListContextValue, SortableListItem, SortableListItemContextValue } from './SortableList.types';

export const SortableListContext = React.createContext<SortableListContextValue | null>(null);

export function useSortableListContext() {
  const context = React.useContext(SortableListContext);

  if (!context) {
    throw new Error('SortableList.Item must be used within SortableList.');
  }

  return context;
}

export const SortableListItemContext = React.createContext<SortableListItemContextValue | null>(null);

export function useSortableListItemContext() {
  const context = React.useContext(SortableListItemContext);

  if (!context) {
    throw new Error('SortableList.DragHandle must be used within SortableList.Item.');
  }

  return context;
}

export function useSortableListHandlers({
  onChange,
  droppableId,
}: {
  readonly onChange: React.Dispatch<React.SetStateAction<SortableListItem[]>>
  readonly droppableId: string
}) {
  const handleDragEnd = React.useCallback((event: DragEndEvent) => {
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
  }, [onChange, droppableId]);

  return {
    handleDragEnd,
  };
}
