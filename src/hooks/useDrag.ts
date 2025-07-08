import { useState, useCallback, useRef, useEffect } from 'react';

interface DragState {
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  startPosition: { x: number; y: number };
}

interface UseDragOptions {
  onDragStart?: (e: MouseEvent) => void;
  onDrag?: (newPosition: { x: number; y: number }) => void;
  onDragEnd?: (finalPosition: { x: number; y: number }) => void;
  boundaryElement?: HTMLElement | null;
}

export function useDrag({ onDragStart, onDrag, onDragEnd, boundaryElement }: UseDragOptions = {}) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
  });

  const dragElementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!dragElementRef.current) return;

      const rect = dragElementRef.current.getBoundingClientRect();
      const startPosition = {
        x: rect.left,
        y: rect.top,
      };

      const dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      setDragState({
        isDragging: true,
        dragOffset,
        startPosition,
      });

      onDragStart?.(e.nativeEvent);
      e.preventDefault();
    },
    [onDragStart]
  );

  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = {
        x: e.clientX - dragState.dragOffset.x,
        y: e.clientY - dragState.dragOffset.y,
      };

      // Boundary checking
      if (boundaryElement) {
        const bounds = boundaryElement.getBoundingClientRect();
        const elementRect = dragElementRef.current?.getBoundingClientRect();

        if (elementRect) {
          newPosition.x = Math.max(0, Math.min(newPosition.x, bounds.width - elementRect.width));
          newPosition.y = Math.max(0, Math.min(newPosition.y, bounds.height - elementRect.height));
        }
      }

      onDrag?.(newPosition);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const finalPosition = {
        x: e.clientX - dragState.dragOffset.x,
        y: e.clientY - dragState.dragOffset.y,
      };

      setDragState((prev) => ({ ...prev, isDragging: false }));
      onDragEnd?.(finalPosition);
    };

    // Throttle mousemove for performance
    let rafId: number;
    const throttledMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => handleMouseMove(e));
    };

    document.addEventListener('mousemove', throttledMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', throttledMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [dragState.isDragging, dragState.dragOffset, boundaryElement, onDrag, onDragEnd]);

  return {
    dragElementRef,
    isDragging: dragState.isDragging,
    handleMouseDown,
  };
}
