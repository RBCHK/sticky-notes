import { useState, useRef } from 'react';
import { StickyNote } from './components/StickyNote/StickyNote';
import type { Note } from './types/note';

import './App.css';

const DEFAULT_NOTE_WIDTH = 250;
const DEFAULT_NOTE_HEIGHT = 200;
const DEFAULT_NOTE_COLOR = 'pink';
const DEFAULT_NOTE_TEXT = 'What would you like to do?';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const notesAreaRef = useRef<HTMLElement>(null);

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

  function handleMoveNoteToFront(noteId: string) {
    setNotes((prevNotes) => {
      const maxZIndex =
        prevNotes.length > 0 ? Math.max(...prevNotes.map((note) => note.zIndex)) : 0;

      const currentNote = prevNotes.find((n) => n.id === noteId);
      if (currentNote && currentNote.zIndex === maxZIndex) {
        return prevNotes;
      }

      return prevNotes.map((n) => (n.id === noteId ? { ...n, zIndex: maxZIndex + 1 } : n));
    });
  }

  function handleUpdateNotePosition(noteId: string, newPosition: { x: number; y: number }) {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === noteId ? { ...note, position: newPosition } : note))
    );
  }

  function handleUpdateNoteText(noteId: string, newText: string) {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === noteId ? { ...note, text: newText } : note))
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="logo">Sticky Notes</h1>
        <button className="add-note-btn" onClick={handleAddNote}>
          + Add Note
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
            boundaryElement={notesAreaRef.current}
          />
        ))}
      </main>
    </div>
  );
}

export default App;
