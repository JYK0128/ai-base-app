'use client';

import { DragOverlay,
         useDragOperation } from '@dnd-kit/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { useDropMoveResolver } from './Tree.hooks';
import type { TreeDragOverlayNodeProps,
              TreeViewportProps } from './Tree.types';
import { buildVisibleTreeItems,
         collectNodeAndDescendantIds,
         findNodeById,
         getDefaultNodeLabel,
         getNodeChildren } from './Tree.utils';
import { TreeNodeRow } from './TreeNodeRow';

/**
 * 현재 트리 상태를 화면에만 그리는 전용 뷰다.
 *
 * 드래그 상태를 읽고, 보이는 노드 목록과 overlay를 함께 만든다.
 */
export function TreeViewport<T>(props: Readonly<TreeViewportProps<T>>) {
  const {
    value,
    expandedIdSet,
    toggleExpanded,
    resolveMove,
    renderNode,
    renderDropIndicator,
    renderEmpty,
    getNodeDisabled,
    indentationWidth,
    ...rootProps
  } = props;

  const { source } = useDragOperation();
  const activeSourceIdValue = source?.id;
  const activeSourceId = activeSourceIdValue === undefined ? null : String(activeSourceIdValue);
  const isDragging = activeSourceId !== null;
  const sortableGroupId = React.useId();
  const visibleItems = React.useMemo(
    () => buildVisibleTreeItems(getNodeChildren(value), expandedIdSet, value.id),
    [value, expandedIdSet],
  );
  const activeSourceNode = React.useMemo(() => {
    if (!activeSourceId) {
      return undefined;
    }

    return findNodeById(value, activeSourceId);
  }, [activeSourceId, value]);
  const hiddenNodeIdSet = React.useMemo(() => {
    if (!activeSourceNode) {
      return null;
    }

    return new Set(collectNodeAndDescendantIds(activeSourceNode).slice(1));
  }, [activeSourceNode]);
  const renderedVisibleItems = React.useMemo(() => {
    if (!hiddenNodeIdSet) {
      return visibleItems;
    }

    return visibleItems.filter(({ node }) => !hiddenNodeIdSet.has(node.id));
  }, [hiddenNodeIdSet, visibleItems]);
  const resolveDropMove = useDropMoveResolver({
    activeSourceId,
    rootId: value.id,
    visibleItems: renderedVisibleItems,
    resolveMove,
  });

  const treeContent = renderedVisibleItems.length > 0
    ? renderedVisibleItems.map((item, index) => {
      const isLastVisibleItem = index === renderedVisibleItems.length - 1;

      return (
        <TreeNodeRow
          key={item.node.id}
          item={item}
          indentationWidth={indentationWidth}
          sortableGroupId={sortableGroupId}
          isDragging={isDragging}
          isExpanded={expandedIdSet.has(item.node.id)}
          toggleExpanded={toggleExpanded}
          getNodeDisabled={getNodeDisabled}
          renderNode={renderNode}
          renderDropIndicator={renderDropIndicator}
          resolveDropMove={resolveDropMove}
          showAfterIndicator={isLastVisibleItem}
        />
      );
    })
    : renderEmpty({ root: value });

  return (
    <>
      <div
        {...rootProps}
        role="tree"
        data-tree-root-id={value.id}
      >
        {treeContent}
      </div>

      {activeSourceNode
        ? (
          <DragOverlay className="pointer-events-none opacity-70">
            <TreeDragOverlayNode
              node={activeSourceNode}
              depth={0}
              expandedIdSet={expandedIdSet}
              renderNode={renderNode}
              getNodeDisabled={getNodeDisabled}
              indentationWidth={indentationWidth}
            />
          </DragOverlay>
        )
        : null}
    </>
  );
}

function TreeDragOverlayNode<T>(props: Readonly<TreeDragOverlayNodeProps<T>>) {
  const {
    node,
    depth,
    expandedIdSet,
    renderNode,
    getNodeDisabled,
    indentationWidth,
  } = props;

  const children = getNodeChildren(node);
  const hasChildren = children.length > 0;
  const isExpanded = expandedIdSet.has(node.id);
  const label = getDefaultNodeLabel(node);
  const isDisabled = getNodeDisabled(node);
  const expandActionLabel = isExpanded ? 'Collapse' : 'Expand';
  const expandButtonAriaLabel = hasChildren ? `${expandActionLabel} ${label}` : undefined;
  let expandIcon = '';
  if (hasChildren) {
    expandIcon = isExpanded ? 'v' : '>';
  }
  const overlayChildren = React.useMemo(() => {
    if (!hasChildren || !isExpanded) {
      return undefined;
    }

    return children.map((child) => (
      <TreeDragOverlayNode
        key={child.id}
        node={child}
        depth={depth + 1}
        expandedIdSet={expandedIdSet}
        renderNode={renderNode}
        getNodeDisabled={getNodeDisabled}
        indentationWidth={indentationWidth}
      />
    ));
  }, [children, depth, expandedIdSet, getNodeDisabled, hasChildren, indentationWidth, isExpanded, renderNode]);

  const overlayChildrenContent = overlayChildren
    ? (
      <div className="grid gap-0.5">
        {overlayChildren}
      </div>
    )
    : null;

  return (
    <div
      role="treeitem"
      aria-level={depth + 1}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-disabled={isDisabled || undefined}
      data-tree-node-id={node.id}
      className={cn(
        'group/tree-item grid gap-1 rounded-md border border-transparent bg-background pr-2 text-sm outline-none transition-colors',
        isDisabled && 'opacity-55',
      )}
      style={{
        paddingInlineStart: depth * indentationWidth,
        touchAction: 'none',
      }}
    >
      <div className="flex min-h-9 items-center gap-1">
        <button
          type="button"
          aria-label={expandButtonAriaLabel}
          aria-hidden={!hasChildren}
          disabled
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors disabled:pointer-events-none disabled:opacity-0"
        >
          {expandIcon}
        </button>

        <button
          type="button"
          disabled
          aria-label={`Drag ${label}`}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground disabled:cursor-not-allowed"
        >
          ::
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          {renderNode({
            node,
            depth,
            state: {
              isExpanded,
              isDragging: false,
              isDropTarget: false,
              isDisabled,
            },
          })}
        </div>
      </div>

      {overlayChildrenContent}
    </div>
  );
}
