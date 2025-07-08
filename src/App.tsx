import { useState, useRef, useCallback } from 'react';
import StickyNote from './components/StickyNote/StickyNote';
import { TrashZone } from './components/TrashZone/TrashZone';
import type { Note } from './types/note';

import './App.css';

const DEFAULT_NOTE_WIDTH = 250;
const DEFAULT_NOTE_HEIGHT = 200;
const DEFAULT_NOTE_COLOR = 'pink';
const DEFAULT_NOTE_TEXT = '';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const notesAreaRef = useRef<HTMLElement>(null);
  const trashZoneRef = useRef<HTMLDivElement>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);

  function handleAddNote() {
    const notesArea = notesAreaRef.current;
    if (!notesArea) return;

    const { width: areaWidth, height: areaHeight } = notesArea.getBoundingClientRect();

    // Center the note and add a small random offset
    const x = areaWidth / 2 - DEFAULT_NOTE_WIDTH / 2 + (Math.random() * 50 - 25);
    const y = areaHeight / 2 - DEFAULT_NOTE_HEIGHT / 2 + (Math.random() * 50 - 25);

    const maxZIndex = notes.length > 0 ? Math.max(...notes.map((note) => note.zIndex)) : 0;

    const newNote: Note = {
      id: `note_${Date.now()}`,
      text: DEFAULT_NOTE_TEXT,
      color: DEFAULT_NOTE_COLOR,
      position: { x, y },
      size: { width: DEFAULT_NOTE_WIDTH, height: DEFAULT_NOTE_HEIGHT },
      zIndex: maxZIndex + 1,
    };

    setNotes([...notes, newNote]);
  }

  const handleDeleteNote = useCallback((noteId: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
  }, []);

  const handleDragEnd = useCallback(
    (noteId: string, { isDroppedOnTrash }: { isDroppedOnTrash: boolean }) => {
      if (isDroppedOnTrash) {
        handleDeleteNote(noteId);
      }
      setDraggingNoteId(null);
      setIsOverTrash(false);
    },
    [handleDeleteNote]
  );

  const handleMoveNoteToFront = useCallback((noteId: string) => {
    setDraggingNoteId(noteId);
    setNotes((prevNotes) => {
      const maxZIndex =
        prevNotes.length > 0 ? Math.max(...prevNotes.map((note) => note.zIndex)) : 0;

      const currentNote = prevNotes.find((n) => n.id === noteId);
      if (currentNote && currentNote.zIndex === maxZIndex) {
        return prevNotes;
      }

      return prevNotes.map((n) => (n.id === noteId ? { ...n, zIndex: maxZIndex + 1 } : n));
    });
  }, []);

  const handleUpdateNotePosition = useCallback(
    (noteId: string, newPosition: { x: number; y: number }) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === noteId ? { ...note, position: newPosition } : note))
      );
    },
    []
  );

  const handleUpdateNoteSize = useCallback(
    (noteId: string, newSize: { width: number; height: number }) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === noteId ? { ...note, size: newSize } : note))
      );
    },
    []
  );

  const handleUpdateNoteText = useCallback((noteId: string, newText: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === noteId ? { ...note, text: newText } : note))
    );
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="logo">Sticky Notes</h1>
        <button className="add-note-btn" onClick={handleAddNote}>
          Add new note
        </button>
      </header>
      <main className="notes-area" ref={notesAreaRef}>
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            onMoveNoteToFront={handleMoveNoteToFront}
            onUpdatePosition={handleUpdateNotePosition}
            onUpdateText={handleUpdateNoteText}
            onUpdateSize={handleUpdateNoteSize}
            onDragEnd={(result) => handleDragEnd(note.id, result)}
            onHoverTrash={setIsOverTrash}
            boundaryElement={notesAreaRef.current}
            trashZoneRef={trashZoneRef}
          />
        ))}
      </main>
      <TrashZone ref={trashZoneRef} isDragging={!!draggingNoteId} isOverTrash={isOverTrash} />
    </div>
  );
}

export default App;
