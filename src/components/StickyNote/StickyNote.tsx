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
  onUpdateColor: (id: string) => void;
  onDragEnd: (result: { isDroppedOnTrash: boolean }) => void;
  onHoverTrash: (isOver: boolean) => void;
  boundaryElement?: HTMLElement | null;
  trashZoneRef?: React.RefObject<HTMLElement | null>;
}

export function StickyNote({
  note,
  onMoveNoteToFront,
  onUpdatePosition,
  onUpdateText,
  onUpdateSize,
  onUpdateColor,
  onDragEnd,
  onHoverTrash,
  boundaryElement,
  trashZoneRef,
}: StickyNoteProps) {
  const { isSaving } = note;
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

  const handleDragEnd = useCallback(
    (result: { isDroppedOnTrash: boolean }) => {
      onDragEnd(result);
    },
    [onDragEnd]
  );

  const handleResize = useCallback(
    (newSize: { width: number; height: number }) => {
      onUpdateSize(note.id, newSize);
    },
    [note.id, onUpdateSize]
  );

  const {
    isDragging,
    isOverTrash,
    handleMouseDown: handleDragMouseDown,
  } = useDrag({
    onDragStart: handleDragStart,
    onDrag: handleDrag,
    onDragEnd: handleDragEnd,
    boundaryElement,
    dragElementRef: noteRef,
    trashZoneRef,
  });

  useEffect(() => {
    if (isDragging) {
      onHoverTrash(isOverTrash);
    }
  }, [isDragging, isOverTrash, onHoverTrash]);

  const { handleMouseDown: handleResizeMouseDown } = useResize({
    noteRef,
    onResize: handleResize,
  });

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isSaving) return;
      e.stopPropagation();
      setIsEditing(true);
      setLocalText(note.text);
    },
    [note.text, isSaving]
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
    if (localText !== note.text) {
      onUpdateText(note.id, localText);
    }
  }, [localText, note.text, note.id, onUpdateText]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value);
  }, []);

  const handleColorChange = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onUpdateColor(note.id);
    },
    [note.id, onUpdateColor]
  );

  return (
    <div
      ref={noteRef}
      className={`${styles.stickyNote} ${isDragging ? styles.dragging : ''} ${
        isOverTrash ? styles.overTrash : ''
      } ${isSaving ? styles.saving : ''}`}
      style={{
        transform: `translate(${note.position.x}px, ${note.position.y}px)`,
        width: note.size.width,
        height: note.size.height,
        backgroundColor: note.color,
        zIndex: note.zIndex,
      }}
      onMouseDown={!isSaving ? handleDragMouseDown : undefined}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className={styles.colorChangeButton}
        onClick={handleColorChange}
        onMouseDown={(e) => e.stopPropagation()}
      />
      <textarea
        ref={textareaRef}
        className={styles.noteText}
        value={isEditing ? localText : note.text}
        onChange={handleTextChange}
        onBlur={handleBlur}
        readOnly={!isEditing || isSaving}
        placeholder={isSaving ? 'Saving...' : '✍️ Double click here to add some text!'}
      />
      <div
        className={styles.resizeHandle}
        onMouseDown={!isSaving ? handleResizeMouseDown : undefined}
      />
    </div>
  );
}

export default memo(StickyNote);
