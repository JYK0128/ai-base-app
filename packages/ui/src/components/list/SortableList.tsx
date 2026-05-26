'use client';

import { DragDropProvider } from '@dnd-kit/react';
import * as React from 'react';

import { renderDefaultEmpty, renderDefaultItem } from './SortableList.defaults';
import { useSortableListHandlers, useSortableListValue } from './SortableList.hooks';
import type { SortableListDndProps } from './SortableList.types';
import { SortableListViewport } from './SortableListViewport';

export function SortableListDnd<T>({
  value: controlledValue,
  defaultValue,
  onChange,
  renderItem = renderDefaultItem,
  renderEmpty = renderDefaultEmpty,
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
