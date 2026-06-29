import * as React from 'react';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeWheelDelta(delta: number, deltaMode: number, size: number) {
  if (deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return delta * 16;
  }

  if (deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return delta * size;
  }

  return delta;
}

function findHorizontalScrollTarget(path: readonly EventTarget[]): HTMLElement | null {
  for (const node of path) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }

    const style = window.getComputedStyle(node);
    const canScrollX = /(auto|scroll|overlay)/.test(style.overflowX) && node.scrollWidth > node.clientWidth + 1;

    if (canScrollX) {
      return node;
    }
  }

  return null;
}

export function useWheelScroll() {
  React.useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (!event.shiftKey) {
        return;
      }

      const target = findHorizontalScrollTarget(event.composedPath());

      if (!target) {
        return;
      }

      const rawDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const delta = normalizeWheelDelta(rawDelta, event.deltaMode, target.clientWidth);

      if (delta === 0) {
        return;
      }

      const maxScrollLeft = Math.max(0, target.scrollWidth - target.clientWidth);
      const nextScrollLeft = clamp(target.scrollLeft + delta, 0, maxScrollLeft);

      if (nextScrollLeft === target.scrollLeft) {
        return;
      }

      event.preventDefault();
      target.scrollLeft = nextScrollLeft;
    };

    document.addEventListener('wheel', handleWheel, { capture: true, passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel, true);
    };
  }, []);
}
