import { useCallback } from 'react';
import { useDrag } from '../../hooks/useDrag';
import type { Note } from '../../types/note';
import styles from './StickyNote.module.css';

interface StickyNoteProps {
  note: Note;
  onMoveNoteToFront: (id: string) => void;
  onUpdatePosition: (id: string, position: { x: number; y: number }) => void;
  boundaryElement?: HTMLElement | null;
}

export function StickyNote({
  note,
  onMoveNoteToFront,
  onUpdatePosition,
  boundaryElement,
}: StickyNoteProps) {
  const handleDragStart = useCallback(() => {
    onMoveNoteToFront(note.id);
  }, [note.id, onMoveNoteToFront]);

  const handleDrag = useCallback(
    (newPosition: { x: number; y: number }) => {
      onUpdatePosition(note.id, newPosition);
    },
    [note.id, onUpdatePosition]
  );

  const { dragElementRef, isDragging, handleMouseDown } = useDrag({
    onDragStart: handleDragStart,
    onDrag: handleDrag,
    boundaryElement,
  });

  return (
    <div
      ref={dragElementRef}
      className={`${styles.stickyNote} ${isDragging ? styles.dragging : ''}`}
      style={{
        transform: `translate(${note.position.x}px, ${note.position.y}px)`,
        width: note.size.width,
        height: note.size.height,
        backgroundColor: note.color,
        zIndex: note.zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      <textarea
        className={styles.noteText}
        defaultValue={note.text}
        onMouseDown={(e) => e.stopPropagation()} // Prevent drag when editing text
      />
    </div>
  );
}
