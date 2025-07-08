import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import StickyNote from './components/StickyNote/StickyNote';
import { TrashZone } from './components/TrashZone/TrashZone';
import type { Note } from './types/note';
import { NOTE_COLORS } from './types/note';
import * as api from './services/api';
import { debounce } from './utils/debounce';

import './App.css';

const DEFAULT_NOTE_WIDTH = 250;
const DEFAULT_NOTE_HEIGHT = 200;
const DEFAULT_NOTE_COLOR = NOTE_COLORS[0];

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const notesAreaRef = useRef<HTMLElement>(null);
  const trashZoneRef = useRef<HTMLDivElement>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const fetchedNotes = await api.getNotes();
        setNotes(fetchedNotes);
      } catch (err) {
        setError('Failed to fetch notes. Please try refreshing the page.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const handleUpdateNote = useCallback(
    async (noteId: string, updatedFields: Partial<Omit<Note, 'id'>>) => {
      const originalNotes = [...notes];
      const updatedNote = notes.find((n) => n.id === noteId);
      if (!updatedNote) return;

      const newNotes = notes.map((note) =>
        note.id === noteId ? { ...note, ...updatedFields } : note
      );
      setNotes(newNotes);

      try {
        await api.updateNote(noteId, updatedFields);
      } catch (err) {
        setError(`Failed to update note. Please try again.`);
        console.error(err);
        setNotes(originalNotes);
      }
    },
    [notes]
  );

  async function handleAddNote() {
    const notesArea = notesAreaRef.current;
    if (!notesArea) return;

    const { width: areaWidth, height: areaHeight } = notesArea.getBoundingClientRect();

    const x = areaWidth / 2 - DEFAULT_NOTE_WIDTH / 2 + (Math.random() * 50 - 25);
    const y = areaHeight / 2 - DEFAULT_NOTE_HEIGHT / 2 + (Math.random() * 50 - 25);

    const noteData = {
      text: '',
      color: DEFAULT_NOTE_COLOR,
      position: { x, y },
      size: { width: DEFAULT_NOTE_WIDTH, height: DEFAULT_NOTE_HEIGHT },
    };

    const tempId = `temp_${Date.now()}`;
    const maxZIndex = notes.length > 0 ? Math.max(...notes.map((note) => note.zIndex)) : 0;
    const tempNewNote: Note = {
      ...noteData,
      id: tempId,
      zIndex: maxZIndex + 1,
      isSaving: true,
    };
    setNotes([...notes, tempNewNote]);

    try {
      const savedNote = await api.createNote(noteData);
      // Replace temporary note with the real one from the server
      setNotes((prevNotes) =>
        prevNotes.map((n) => (n.id === tempId ? { ...savedNote, isSaving: false } : n))
      );
    } catch (err) {
      setError('Failed to create a new note. Please try again.');
      console.error(err);
      setNotes((prevNotes) => prevNotes.filter((n) => n.id !== tempId));
    }
  }

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      const originalNotes = [...notes];
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));

      try {
        await api.deleteNote(noteId);
      } catch (err) {
        setError('Failed to delete the note. Please try again.');
        console.error(err);
        setNotes(originalNotes);
      }
    },
    [notes]
  );

  const handleUpdateNoteColor = useCallback(
    (noteId: string) => {
      const noteToUpdate = notes.find((n) => n.id === noteId);
      if (!noteToUpdate) return;

      const currentColorIndex = NOTE_COLORS.indexOf(noteToUpdate.color);
      const nextColorIndex = (currentColorIndex + 1) % NOTE_COLORS.length;
      const newColor = NOTE_COLORS[nextColorIndex];
      handleUpdateNote(noteId, { color: newColor });
    },
    [notes, handleUpdateNote]
  );

  // --- Debounce Logic ---
  const handleUpdateNoteRef = useRef(handleUpdateNote);
  useEffect(() => {
    handleUpdateNoteRef.current = handleUpdateNote;
  }, [handleUpdateNote]);

  const debouncedUpdateNote = useMemo(
    () =>
      debounce((noteId: string, updatedFields: Partial<Omit<Note, 'id'>>) => {
        handleUpdateNoteRef.current(noteId, updatedFields);
      }, 300),
    []
  );

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

  const handleMoveNoteToFront = useCallback(
    (noteId: string) => {
      setDraggingNoteId(noteId);
      const maxZIndex = notes.length > 0 ? Math.max(...notes.map((note) => note.zIndex)) : 0;
      const currentNote = notes.find((n) => n.id === noteId);

      if (currentNote && currentNote.zIndex <= maxZIndex) {
        handleUpdateNote(noteId, { zIndex: maxZIndex + 1 });
      }
    },
    [notes, handleUpdateNote]
  );

  const handleUpdateNotePosition = useCallback(
    (noteId: string, newPosition: { x: number; y: number }) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === noteId ? { ...note, position: newPosition } : note))
      );
      debouncedUpdateNote(noteId, { position: newPosition });
    },
    [debouncedUpdateNote]
  );

  const handleUpdateNoteSize = useCallback(
    (noteId: string, newSize: { width: number; height: number }) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === noteId ? { ...note, size: newSize } : note))
      );
      debouncedUpdateNote(noteId, { size: newSize });
    },
    [debouncedUpdateNote]
  );

  const handleUpdateNoteText = useCallback(
    (noteId: string, newText: string) => {
      handleUpdateNote(noteId, { text: newText });
    },
    [handleUpdateNote]
  );

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
