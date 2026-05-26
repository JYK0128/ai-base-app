'use client';

import { DragDropProvider } from '@dnd-kit/react';

import { renderDefaultDropIndicator,
         renderDefaultEmpty,
         renderDefaultNodeContent } from './SortableTree.defaults';
import { useSortableTreeExpandedNodeIds,
         useSortableTreeMoveController,
         useSortableTreeValue } from './SortableTree.hooks';
import type { SortableTreeProps } from './SortableTree.types';
import { DEFAULT_INDENT,
         getDefaultNodeDisabled } from './SortableTree.utils';
import { SortableTreeViewport } from './SortableTreeViewport';

/**
 * TreeNode 루트 데이터를 DND 가능한 트리 UI로 렌더링한다.
 */
export function SortableTree<T>(props: Readonly<SortableTreeProps<T>>) {
  const {
    value: controlledValue,
    defaultValue,
    onChange,
    renderNode,
    getNodeDisabled,
    canDrop,
    expandedIds,
    defaultExpandedIds,
    onExpandedIdsChange,
    renderDropIndicator,
    renderEmpty,
    indentationWidth = DEFAULT_INDENT,
    ...rootProps
  } = props;

  const [value, setValue] = useSortableTreeValue(controlledValue, defaultValue, onChange);
  const {
    expandedIdSet,
    setNodeExpanded,
    toggleExpanded,
  } = useSortableTreeExpandedNodeIds({
    root: value,
    expandedIds,
    defaultExpandedIds,
    onExpandedIdsChange,
  });
  const {
    handleDragEnd,
    resolveMove,
  } = useSortableTreeMoveController({
    value,
    canDrop,
    setValue,
    setNodeExpanded,
  });
  const rootPropsWithAriaLabel = rootProps['aria-label'] === undefined
    ? {
      ...rootProps,
      'aria-label': 'Tree editor',
    }
    : rootProps;

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <SortableTreeViewport
        value={value}
        expandedIdSet={expandedIdSet}
        toggleExpanded={toggleExpanded}
        resolveMove={resolveMove}
        renderNode={renderNode ?? renderDefaultNodeContent}
        renderDropIndicator={renderDropIndicator ?? renderDefaultDropIndicator}
        renderEmpty={renderEmpty ?? renderDefaultEmpty}
        getNodeDisabled={getNodeDisabled ?? getDefaultNodeDisabled}
        indentationWidth={indentationWidth}
        {...rootPropsWithAriaLabel}
      />
    </DragDropProvider>
  );
}
