import { arrayMove, move } from '@dnd-kit/helpers';
import type { DragEndEvent } from '@dnd-kit/react';
import { isSortable, isSortableOperation } from '@dnd-kit/react/sortable';
import * as React from 'react';

import type { SortableListItem,
              UseSortableListHandlersArgs,
              UseSortableListHandlersResult } from './SortableList.types';

export function useSortableListValue<T>(
  controlledValue: (SortableListItem & T)[] | undefined,
  defaultValue: (SortableListItem & T)[] | undefined,
  onChange: ((next: (SortableListItem & T)[]) => void) | undefined,
) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<(SortableListItem & T)[]>(() => {
    const initialValue = defaultValue ?? controlledValue;

    if (!initialValue) {
      throw new Error('SortableList requires either value or defaultValue.');
    }

    return initialValue;
  });
  const isControlled = controlledValue !== undefined;
  const value = controlledValue ?? uncontrolledValue;

  const setValue = React.useCallback((nextValue: (SortableListItem & T)[]) => {
    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }

    onChange?.(nextValue);
  }, [isControlled, onChange]);

  return [value, setValue] as const;
}

export function useSortableListHandlers<T>({
  value,
  setValue,
  droppableId,
}: UseSortableListHandlersArgs<T>): UseSortableListHandlersResult {
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

      const lastIndex = value.length - 1;
      if (lastIndex < 0 || source.initialIndex === lastIndex) {
        return;
      }

      setValue(arrayMove(value, source.initialIndex, lastIndex));
      return;
    }

    if (!isSortableOperation(event.operation)) {
      return;
    }

    setValue(move(value, event));
  }, [value, setValue, droppableId]);

  return {
    handleDragEnd,
  };
}
