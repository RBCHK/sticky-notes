import { useRef } from 'react';
import StickyNote from './components/StickyNote/StickyNote';
import { TrashZone } from './components/TrashZone/TrashZone';
import { useNotes } from './hooks/useNotes';

import './App.css';

function App() {
  const notesAreaRef = useRef<HTMLElement>(null);
  const trashZoneRef = useRef<HTMLDivElement>(null);
  const {
    notes,
    isLoading,
    error,
    draggingNoteId,
    isOverTrash,
    handleAddNote,
    handleDragEnd,
    handleMoveNoteToFront,
    handleUpdateNotePosition,
    handleUpdateNoteText,
    handleUpdateNoteSize,
    handleUpdateNoteColor,
    setIsOverTrash,
  } = useNotes({ notesAreaRef });

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="logo">Sticky Notes</h1>
        <button className="add-note-btn" onClick={handleAddNote} disabled={isLoading}>
          + New Sticky
        </button>
      </header>
      <main className="notes-area" ref={notesAreaRef}>
        {isLoading && <div className="loading-indicator">Loading notes...</div>}
        {error && <div className="error-message">{error}</div>}
        {!isLoading && !error && notes.length === 0 && (
          <div className="empty-state">
            <h2>Clean board, clean mind.</h2>
            <p>Click "+ New Sticky" to get things going.</p>
          </div>
        )}
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            onMoveNoteToFront={handleMoveNoteToFront}
            onUpdatePosition={handleUpdateNotePosition}
            onUpdateText={handleUpdateNoteText}
            onUpdateSize={handleUpdateNoteSize}
            onUpdateColor={handleUpdateNoteColor}
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
