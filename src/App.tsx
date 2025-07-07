import { useState } from 'react';
import type { Note } from './types/note';
import { StickyNote } from './components/StickyNote/StickyNote';
import './App.css';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);

  function handleAddNote() {
    const newNote: Note = {
      id: `note_${Date.now()}`,
      text: 'What would you like to do?',
      color: 'pink',
      position: { x: 50, y: 50 },
      size: { width: 250, height: 200 },
      zIndex: notes.length + 1,
    };
    setNotes([...notes, newNote]);
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="logo">Sticky Notes</h1>
        <button className="add-note-btn" onClick={handleAddNote}>
          + Add Note
        </button>
      </header>
      <main className="notes-area">
        {notes.map((note) => (
          <StickyNote key={note.id} note={note} />
        ))}
      </main>
    </div>
  );
}

export default App;
