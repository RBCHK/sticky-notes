import { useCallback, useState, useRef, useEffect, memo } from 'react';
import { useDrag } from '../../hooks/useDrag';
import { useResize } from '../../hooks/useResize';
import type { Note } from '../../types/note';
import styles from './StickyNote.module.css';

interface StickyNoteProps {
  note: Note;
  onMoveNoteToFront: (id: string) => void;
  onUpdatePosition: (id: string, position: { x: number; y: number }) => void;
  onUpdateText: (id: string, text: string) => void;
  onUpdateSize: (id: string, size: { width: number; height: number }) => void;
  boundaryElement?: HTMLElement | null;
}

export function StickyNote({
  note,
  onMoveNoteToFront,
  onUpdatePosition,
  onUpdateText,
  onUpdateSize,
  boundaryElement,
}: StickyNoteProps) {
  console.log(`Ререндер заметки: ${note.id}`);
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(note.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback(() => {
    onMoveNoteToFront(note.id);
  }, [note.id, onMoveNoteToFront]);

  const handleDrag = useCallback(
    (newPosition: { x: number; y: number }) => {
      onUpdatePosition(note.id, newPosition);
    },
    [note.id, onUpdatePosition]
  );

  const handleResize = useCallback(
    (newSize: { width: number; height: number }) => {
      onUpdateSize(note.id, newSize);
    },
    [note.id, onUpdateSize]
  );

  const { isDragging, handleMouseDown: handleDragMouseDown } = useDrag({
    onDragStart: handleDragStart,
    onDrag: handleDrag,
    boundaryElement,
    dragElementRef: noteRef,
  });

  const { handleMouseDown: handleResizeMouseDown } = useResize({
    noteRef,
    onResize: handleResize,
    onResizeEnd: handleResize,
  });

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditing(true);
      setLocalText(note.text);
    },
    [note.text]
  );

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    // Save only when exiting edit mode
    if (localText !== note.text) {
      onUpdateText(note.id, localText);
    }
  }, [localText, note.text, note.id, onUpdateText]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value);
  }, []);

  return (
    <div
      ref={noteRef}
      className={`${styles.stickyNote} ${isDragging ? styles.dragging : ''}`}
      style={{
        transform: `translate(${note.position.x}px, ${note.position.y}px)`,
        width: note.size.width,
        height: note.size.height,
        backgroundColor: note.color,
        zIndex: note.zIndex,
      }}
      onMouseDown={handleDragMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <textarea
        ref={textareaRef}
        className={styles.noteText}
        value={isEditing ? localText : note.text}
        onChange={handleTextChange}
        onBlur={handleBlur}
        readOnly={!isEditing}
        placeholder={'What would you like to do?'}
      />
      <div className={styles.resizeHandle} onMouseDown={handleResizeMouseDown} />
    </div>
  );
}

export default memo(StickyNote);
