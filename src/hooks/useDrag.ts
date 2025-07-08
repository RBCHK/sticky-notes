import { useState, useCallback, useEffect } from 'react';

interface DragState {
  isDragging: boolean;
  isOverTrash: boolean;
  dragOffset: { x: number; y: number };
  startPosition: { x: number; y: number };
}

interface UseDragOptions {
  onDragStart?: (e: MouseEvent) => void;
  onDrag?: (newPosition: { x: number; y: number }) => void;
  onDragEnd?: (result: { isDroppedOnTrash: boolean }) => void;
  boundaryElement?: HTMLElement | null;
  dragElementRef: React.RefObject<HTMLDivElement | null>;
  trashZoneRef?: React.RefObject<HTMLElement | null>;
}

export function useDrag({
  onDragStart,
  onDrag,
  onDragEnd,
  boundaryElement,
  dragElementRef,
  trashZoneRef,
}: UseDragOptions) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isOverTrash: false,
    dragOffset: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
  });

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
        isOverTrash: false,
        dragOffset,
        startPosition,
      });

      onDragStart?.(e.nativeEvent);
      e.preventDefault();
    },
    [onDragStart, dragElementRef]
  );

  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragElementRef.current) return;
      let isOverTrash = false;
      const newPositionViewport = {
        x: e.clientX - dragState.dragOffset.x,
        y: e.clientY - dragState.dragOffset.y,
      };
      let newPosition = { ...newPositionViewport };

      if (boundaryElement) {
        const bounds = boundaryElement.getBoundingClientRect();
        const elementRect = dragElementRef.current.getBoundingClientRect();

        // Convert viewport coordinates to be relative to the boundary element
        newPosition = {
          x: newPositionViewport.x - bounds.left,
          y: newPositionViewport.y - bounds.top,
        };

        if (elementRect) {
          newPosition.x = Math.max(0, Math.min(newPosition.x, bounds.width - elementRect.width));
          newPosition.y = Math.max(0, Math.min(newPosition.y, bounds.height - elementRect.height));
        }
      }

      // Check for intersection with trash zone
      if (trashZoneRef?.current && dragElementRef.current) {
        const trashRect = trashZoneRef.current.getBoundingClientRect();
        const elementRect = dragElementRef.current.getBoundingClientRect();
        const currentElementRect = {
          left: newPositionViewport.x,
          top: newPositionViewport.y,
          right: newPositionViewport.x + elementRect.width,
          bottom: newPositionViewport.y + elementRect.height,
          width: elementRect.width,
          height: elementRect.height,
          x: newPositionViewport.x,
          y: newPositionViewport.y,
          toJSON: () => '',
        };

        if (
          currentElementRect.left < trashRect.right &&
          currentElementRect.right > trashRect.left &&
          currentElementRect.top < trashRect.bottom &&
          currentElementRect.bottom > trashRect.top
        ) {
          isOverTrash = true;
        }
      }

      setDragState((prev) => ({ ...prev, isOverTrash }));
      onDrag?.(newPosition);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!dragElementRef.current) return;

      setDragState((prev) => ({ ...prev, isDragging: false, isOverTrash: false }));
      onDragEnd?.({ isDroppedOnTrash: dragState.isOverTrash });
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
  }, [
    dragState.isDragging,
    dragState.dragOffset,
    boundaryElement,
    onDrag,
    onDragEnd,
    dragElementRef,
    trashZoneRef,
  ]);

  return {
    isDragging: dragState.isDragging,
    isOverTrash: dragState.isOverTrash,
    handleMouseDown,
  };
}
