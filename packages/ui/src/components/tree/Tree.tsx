'use client';

import { DragDropProvider } from '@dnd-kit/react';

import { renderDefaultDropIndicator,
         renderDefaultEmpty,
         renderDefaultNodeContent } from './Tree.defaults';
import { useExpandedNodeIds,
         useTreeMoveController,
         useTreeValue } from './Tree.hooks';
import type { TreeDndProps } from './Tree.types';
import { DEFAULT_INDENT,
         getDefaultNodeDisabled } from './Tree.utils';
import { TreeViewport } from './TreeViewport';

export type { TreeDndMove,
  TreeDndProps,
  TreeDndRenderDropIndicatorArgs,
  TreeDndRenderDropState,
  TreeDndRenderEmptyArgs,
  TreeDndRenderNodeArgs,
  TreeDndRenderNodeState } from './Tree.types';

/**
 * TreeNode 루트 데이터를 DND 가능한 트리 UI로 렌더링한다.
 */
function TreeDnd<T>(props: Readonly<TreeDndProps<T>>) {
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

  const [value, setValue] = useTreeValue(controlledValue, defaultValue, onChange);
  const {
    expandedIdSet,
    setNodeExpanded,
    toggleExpanded,
  } = useExpandedNodeIds({
    root: value,
    expandedIds,
    defaultExpandedIds,
    onExpandedIdsChange,
  });
  const {
    handleDragEnd,
    resolveMove,
  } = useTreeMoveController({
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
      <TreeViewport
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

export { TreeDnd };
