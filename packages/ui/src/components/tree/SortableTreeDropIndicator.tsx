import { useSortableTreeDropZone } from './SortableTree.hooks';
import type { SortableTreeDropIndicatorProps } from './SortableTree.types';

/**
 * before/after 위치에 보이는 얇은 드롭 표시선을 렌더링한다.
 */
export function SortableTreeDropIndicator<T>({
  isDragging,
  targetId,
  position,
  depth,
  indentationWidth,
  renderDropIndicator,
  resolveDropMove,
}: SortableTreeDropIndicatorProps<T>) {
  const {
    id: dropZoneId,
    isOver,
    isDropAllowed,
    setNodeRef,
  } = useSortableTreeDropZone({
    targetId,
    position,
    resolveDropMove,
  });

  return (
    <div
      ref={setNodeRef}
      data-tree-drop-zone-id={dropZoneId}
      data-tree-drop-target-id={targetId}
      data-tree-drop-position={position}
      className="flex h-2 items-center"
      style={{
        minHeight: 8,
        paddingInlineStart: depth * indentationWidth,
      }}
    >
      {renderDropIndicator({
        targetId,
        position,
        depth,
        state: {
          isOver,
          isDropAllowed,
          isDragging,
        },
      })}
    </div>
  );
}
