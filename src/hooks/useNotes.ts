import { useState, useCallback, useEffect } from 'react';
import type { Note } from '../types/note';
import { NOTE_COLORS } from '../types/note';
import * as api from '../services/api';
import { useDebouncedCallback } from './useDebouncedCallback';

const DEFAULT_NOTE_WIDTH = 250;
const DEFAULT_NOTE_HEIGHT = 200;
const DEFAULT_NOTE_COLOR = NOTE_COLORS[0];
const DEBOUNCE_DELAY = 300;

interface UseNotesProps {
  notesAreaRef: React.RefObject<HTMLElement | null>;
}

export function useNotes({ notesAreaRef }: UseNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const createNoteByDrawing = useCallback(
    async (noteData: Omit<Note, 'id' | 'zIndex' | 'isSaving'>) => {
      const tempId = `temp_${Date.now()}`;
      const maxZIndex = notes.length > 0 ? Math.max(...notes.map((note) => note.zIndex)) : 0;
      const tempNewNote: Note = {
        ...noteData,
        id: tempId,
        zIndex: maxZIndex + 1,
        isSaving: true,
      };

      setNotes((prevNotes) => [...prevNotes, tempNewNote]);

      try {
        const savedNote = await api.createNote(noteData);
        setNotes((prevNotes) =>
          prevNotes.map((n) => (n.id === tempId ? { ...savedNote, isSaving: false } : n))
        );
      } catch (err) {
        setError('Failed to create a new note. Please try again.');
        console.error(err);
        setNotes((prevNotes) => prevNotes.filter((n) => n.id !== tempId));
      }
    },
    [notes]
  );

  const handleAddNote = useCallback(() => {
    const notesArea = notesAreaRef.current;
    if (!notesArea) return;

    const { width: areaWidth, height: areaHeight } = notesArea.getBoundingClientRect();

    const x = areaWidth / 2 - DEFAULT_NOTE_WIDTH / 2 + (Math.random() * 50 - 25);
    const y = areaHeight / 2 - DEFAULT_NOTE_HEIGHT / 2 + (Math.random() * 50 - 25);

    createNoteByDrawing({
      text: '',
      color: DEFAULT_NOTE_COLOR,
      position: { x, y },
      size: { width: DEFAULT_NOTE_WIDTH, height: DEFAULT_NOTE_HEIGHT },
    });
  }, [notesAreaRef, createNoteByDrawing]);

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

  const debouncedUpdateNote = useDebouncedCallback(handleUpdateNote, DEBOUNCE_DELAY);

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

  return {
    notes,
    isLoading,
    error,
    draggingNoteId,
    isOverTrash,
    handleAddNote,
    createNoteByDrawing,
    handleDragEnd,
    handleMoveNoteToFront,
    handleUpdateNotePosition,
    handleUpdateNoteText,
    handleUpdateNoteSize,
    handleUpdateNoteColor,
    setIsOverTrash,
  };
}
