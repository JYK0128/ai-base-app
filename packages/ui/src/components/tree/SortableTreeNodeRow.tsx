import { useSortable } from '@dnd-kit/react/sortable';
import * as React from 'react';

import { cn } from '@/lib/utils';

import type { SortableTreeNodeRowProps, TreeNodeDropTargetData } from './SortableTree.types';
import { getDefaultNodeLabel } from './SortableTree.utils';
import { SortableTreeDropIndicator } from './SortableTreeDropIndicator';

/**
 * 하나의 TreeNode를 행으로 그리고, 행 자체를 sortable inside 대상으로 사용한다.
 */
export function SortableTreeNodeRow<T>(props: Readonly<SortableTreeNodeRowProps<T>>) {
  const {
    item,
    indentationWidth,
    sortableGroupId,
    isDragging,
    isExpanded,
    toggleExpanded,
    getNodeDisabled,
    renderNode,
    renderDropIndicator,
    resolveDropMove,
    showAfterIndicator,
    disabled = false,
  } = props;

  const {
    node,
    depth,
    index,
    parentId,
  } = item;
  const childrenCount = React.useMemo(() => node.children?.length ?? 0, [node.children]);
  const hasChildren = childrenCount > 0;
  const label = getDefaultNodeLabel(node);
  const isDisabled = getNodeDisabled(node);
  const expandButtonAction = isExpanded ? 'Collapse' : 'Expand';
  const expandButtonAriaLabel = hasChildren
    ? `${expandButtonAction} ${label}`
    : undefined;
  const {
    handleRef: setActivatorNodeRef,
    isDragging: isDragSource,
    isDropTarget: isSortableDropTarget,
    ref: setSortableNodeRef,
  } = useSortable<TreeNodeDropTargetData>({
    id: node.id,
    index,
    group: sortableGroupId,
    disabled: disabled || isDisabled,
    data: {
      type: 'tree-node',
      nodeId: node.id,
      parentId,
    },
  });
  const isInsideDropAllowed = Boolean(resolveDropMove(node.id, 'inside'));
  const isDropTarget = isSortableDropTarget && isInsideDropAllowed;
  const handleToggleExpanded = React.useCallback(() => {
    toggleExpanded(node.id);
  }, [node.id, toggleExpanded]);
  let expandIcon = '';
  if (hasChildren) {
    expandIcon = isExpanded ? 'v' : '>';
  }
  return (
    <div
      role="presentation"
      data-tree-row-id={node.id}
      className="
        grid border-b border-slate-100
        last:border-b-0
      "
    >
      {!disabled && (
        <SortableTreeDropIndicator
          isDragging={isDragging}
          targetId={node.id}
          position="before"
          depth={depth}
          indentationWidth={indentationWidth}
          renderDropIndicator={renderDropIndicator}
          resolveDropMove={resolveDropMove}
        />
      )}

      <div
        ref={setSortableNodeRef}
        role="treeitem"
        aria-level={depth + 1}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-disabled={isDisabled || undefined}
        data-tree-node-id={node.id}
        className={cn(
          `
            group/tree-item grid gap-1 rounded-md border border-transparent
            bg-background pr-2 text-sm transition-colors outline-none
          `,
          isDragSource ? 'opacity-0' : isDisabled && 'opacity-55',
          isDropTarget && 'border-primary/50 bg-primary/10',
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
            disabled={!hasChildren}
            onClick={handleToggleExpanded}
            className="
              inline-flex size-7 shrink-0 items-center justify-center rounded-md
              text-muted-foreground transition-colors
              hover:bg-muted hover:text-foreground
              disabled:pointer-events-none disabled:opacity-0
            "
          >
            {expandIcon}
          </button>

          {!disabled && (
            <button
              ref={setActivatorNodeRef}
              type="button"
              disabled={isDisabled}
              aria-label={`Drag ${label}`}
              className="
                inline-flex size-7 shrink-0 cursor-grab items-center
                justify-center rounded-md text-muted-foreground
                transition-colors
                hover:bg-muted hover:text-foreground
                active:cursor-grabbing
                disabled:cursor-not-allowed
              "
            >
              ::
            </button>
          )}

          <div className="
            flex min-w-0 flex-1 items-center justify-between gap-3
          "
          >
            {renderNode({
              node,
              depth,
              state: {
                isExpanded,
                isDragging: isDragSource,
                isDropTarget,
                isDisabled,
              },
            })}
          </div>
        </div>

      </div>

      {showAfterIndicator && !disabled
        ? (
          <SortableTreeDropIndicator
            isDragging={isDragging}
            targetId={node.id}
            position="after"
            depth={depth}
            indentationWidth={indentationWidth}
            renderDropIndicator={renderDropIndicator}
            resolveDropMove={resolveDropMove}
          />
        )
        : null}
    </div>
  );
}
