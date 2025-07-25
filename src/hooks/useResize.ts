import { useState, useCallback, useEffect } from 'react';

export const MIN_WIDTH = 50;
export const MIN_HEIGHT = 50;
export const MAX_WIDTH = 450;
export const MAX_HEIGHT = 450;

interface ResizeState {
  isResizing: boolean;
  startSize: { width: number; height: number };
  startCursor: { x: number; y: number };
}

interface UseResizeOptions {
  onResize?: (newSize: { width: number; height: number }) => void;
  noteRef: React.RefObject<HTMLDivElement | null>;
}

export function useResize({ onResize, noteRef }: UseResizeOptions) {
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    startSize: { width: 0, height: 0 },
    startCursor: { x: 0, y: 0 },
  });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!noteRef.current) return;
      e.stopPropagation(); // Important to prevent drag
      e.preventDefault();

      const rect = noteRef.current.getBoundingClientRect();

      setResizeState({
        isResizing: true,
        startSize: { width: rect.width, height: rect.height },
        startCursor: { x: e.clientX, y: e.clientY },
      });
    },
    [noteRef]
  );

  useEffect(() => {
    if (!resizeState.isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeState.startCursor.x;
      const dy = e.clientY - resizeState.startCursor.y;

      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, resizeState.startSize.width + dx));
      const newHeight = Math.min(
        MAX_HEIGHT,
        Math.max(MIN_HEIGHT, resizeState.startSize.height + dy)
      );

      onResize?.({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setResizeState((prev) => ({ ...prev, isResizing: false }));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeState.isResizing, resizeState.startCursor, resizeState.startSize, onResize]);

  return {
    handleMouseDown,
  };
}
