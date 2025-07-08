import type { Note } from '../../types/note';
import styles from './StickyNote.module.css';

interface StickyNoteProps {
  note: Note;
  onMoveNoteToFront: (id: string) => void;
}

export function StickyNote({ note, onMoveNoteToFront }: StickyNoteProps) {
  function handleMouseDown() {
    onMoveNoteToFront(note.id);
  }

  return (
    <div
      className={styles.stickyNote}
      style={{
        transform: `translate(${note.position.x}px, ${note.position.y}px)`,
        width: note.size.width,
        height: note.size.height,
        backgroundColor: note.color,
        zIndex: note.zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      <textarea className={styles.noteText} defaultValue={note.text} />
    </div>
  );
}
