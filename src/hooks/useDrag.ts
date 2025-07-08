import { useState, useCallback, useRef, useEffect } from 'react';

interface DragState {
  isDragging: boolean;
  isOverTrash: boolean; // New state to track if hovering over trash
  dragOffset: { x: number; y: number };
  startPosition: { x: number; y: number };
}

interface UseDragOptions {
  onDragStart?: (e: MouseEvent) => void;
  onDrag?: (newPosition: { x: number; y: number }) => void;
  onDragEnd?: (result: {
    finalPosition: { x: number; y: number };
    isDroppedOnTrash: boolean;
  }) => void;
  boundaryElement?: HTMLElement | null;
  dragElementRef: React.RefObject<HTMLDivElement | null>;
  trashZoneRef?: React.RefObject<HTMLElement | null>; // Optional ref for the trash zone
}

export function useDrag({
  onDragStart,
  onDrag,
  onDragEnd,
  boundaryElement,
  dragElementRef,
  trashZoneRef, // Destructure the new prop
}: UseDragOptions) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isOverTrash: false, // Initialize new state
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
        isOverTrash: false, // Reset on new drag
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
      const newPosition = {
        x: e.clientX - dragState.dragOffset.x,
        y: e.clientY - dragState.dragOffset.y,
      };

      // Boundary checking
      if (boundaryElement) {
        const bounds = boundaryElement.getBoundingClientRect();
        const elementRect = dragElementRef.current.getBoundingClientRect();

        if (elementRect) {
          newPosition.x = Math.max(0, Math.min(newPosition.x, bounds.width - elementRect.width));
          newPosition.y = Math.max(0, Math.min(newPosition.y, bounds.height - elementRect.height));
        }
      }

      // Check for intersection with trash zone
      if (trashZoneRef?.current) {
        const trashRect = trashZoneRef.current.getBoundingClientRect();
        const elementRect = dragElementRef.current.getBoundingClientRect();
        if (
          elementRect.left < trashRect.right &&
          elementRect.right > trashRect.left &&
          elementRect.top < trashRect.bottom &&
          elementRect.bottom > trashRect.top
        ) {
          isOverTrash = true;
        }
      }

      setDragState((prev) => ({ ...prev, isOverTrash }));
      onDrag?.(newPosition);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const finalPosition = {
        x: e.clientX - dragState.dragOffset.x,
        y: e.clientY - dragState.dragOffset.y,
      };

      setDragState((prev) => ({ ...prev, isDragging: false, isOverTrash: false }));
      onDragEnd?.({ finalPosition, isDroppedOnTrash: dragState.isOverTrash });
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
    trashZoneRef, // Add dependency
  ]);

  return {
    isDragging: dragState.isDragging,
    isOverTrash: dragState.isOverTrash, // Expose new state
    handleMouseDown,
  };
}
