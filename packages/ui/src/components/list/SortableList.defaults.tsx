import { GripVertical } from 'lucide-react';

import type { SortableListDndRenderItemArgs } from './SortableList.types';

/**
 * renderItem이 없을 때 동작 확인 및 즉시 활용 가능한 프리미엄 마크업을 기본 렌더링한다.
 */
export function renderDefaultItem<T>({
  item,
  state,
  dragHandleProps,
  ref,
}: SortableListDndRenderItemArgs<T>) {
  return (
    <div
      ref={ref}
      className={`flex items-center gap-3 rounded-md border bg-card p-3 shadow-sm hover:shadow-md transition-all duration-200 ${
        state.isDragging ? 'opacity-40 border-primary' : 'border-border'
      }`}
    >
      <button
        {...dragHandleProps}
        type="button"
        className="inline-flex size-8 shrink-0 items-center justify-center cursor-grab select-none touch-none active:cursor-grabbing text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
      >
        <GripVertical className="size-4" />
      </button>
      <span className="font-semibold text-sm text-foreground">{String(item.id)}</span>
    </div>
  );
}

/**
 * renderEmpty가 없을 때 비어 있는 리스트 내용을 기본 렌더링한다.
 */
export function renderDefaultEmpty() {
  return (
    <div className="flex min-h-16 items-center justify-center rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
      Empty list
    </div>
  );
}
