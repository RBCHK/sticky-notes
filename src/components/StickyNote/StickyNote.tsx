import type { Note } from '../../types/note';
import styles from './StickyNote.module.css';

interface StickyNoteProps {
  note: Note;
}

export function StickyNote({ note }: StickyNoteProps) {
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
    >
      <textarea className={styles.noteText} defaultValue={note.text} />
    </div>
  );
}
