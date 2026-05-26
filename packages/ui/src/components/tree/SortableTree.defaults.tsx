import { cn } from '@/lib/utils';

import type { SortableTreeRenderDropIndicatorArgs,
              SortableTreeRenderNodeArgs } from './SortableTree.types';
import { getDefaultNodeLabel } from './SortableTree.utils';

/**
 * renderNode가 없을 때 동작 확인이 가능한 최소 마크업을 렌더링한다.
 */
export function renderDefaultNodeContent<T>({
  node,
}: SortableTreeRenderNodeArgs<T>) {
  return (
    <span className="truncate font-medium">
      {getDefaultNodeLabel(node)}
    </span>
  );
}

/**
 * renderDropIndicator가 없을 때 보이지 않는 최소 droppable 영역을 렌더링한다.
 */
export function renderDefaultDropIndicator({
  state,
}: SortableTreeRenderDropIndicatorArgs) {
  return (
    <div
      className={cn(
        'h-0.5 w-full rounded-full transition-colors',
        state.isOver && state.isDragging && state.isDropAllowed && 'bg-primary',
        state.isOver && state.isDragging && !state.isDropAllowed && 'bg-destructive',
      )}
    />
  );
}

/**
 * renderEmpty가 없을 때 비어 있는 트리 내용을 렌더링한다.
 */
export function renderDefaultEmpty() {
  return (
    <div className="flex min-h-16 items-center justify-center rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">
      Empty
    </div>
  );
}
