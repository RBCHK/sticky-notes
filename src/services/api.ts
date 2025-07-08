import type { Note } from '../types/note';

const LOCAL_STORAGE_KEY = 'sticky-notes-data';

const initialNotes: Note[] = [
  {
    id: 'note_1',
    text: 'This is a pre-existing note. Feel free to move it around!',
    color: '#ffffcc',
    position: { x: 100, y: 100 },
    size: { width: 250, height: 200 },
    zIndex: 1,
  },
  {
    id: 'note_2',
    text: 'Double-click to edit the text.',
    color: '#ccccff',
    position: { x: 400, y: 150 },
    size: { width: 250, height: 200 },
    zIndex: 2,
  },
];

// --- LocalStorage Logic ---
let notes: Note[] = [];

const loadNotes = () => {
  try {
    const storedNotes = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedNotes) {
      notes = JSON.parse(storedNotes);
      console.log('API: Loaded notes from LocalStorage.');
    } else {
      // If no notes in storage, use initial notes and save them
      notes = initialNotes;
      saveNotes();
      console.log('API: No notes in LocalStorage, initialized with default notes.');
    }
  } catch (error) {
    console.error('API: Failed to load notes from LocalStorage, using initial notes.', error);
    notes = initialNotes;
  }
};

const saveNotes = () => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('API: Failed to save notes to LocalStorage.', error);
  }
};

// Initial load when the module is first imported
loadNotes();

// Mock API latency
const API_LATENCY = 500;

// --- API Functions ---

export const getNotes = async (): Promise<Note[]> => {
  console.log('API: Fetching notes...');
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('API: Fetched notes successfully.', notes);
      resolve([...notes]);
    }, API_LATENCY);
  });
};

export const createNote = async (
  noteData: Omit<Note, 'id' | 'zIndex'> & { id?: string }
): Promise<Note> => {
  console.log('API: Creating note...', noteData);
  return new Promise((resolve) => {
    setTimeout(() => {
      const maxZIndex = notes.length > 0 ? Math.max(...notes.map((n) => n.zIndex)) : 0;
      const newNote: Note = {
        id: `note_${Date.now()}`,
        ...noteData,
        zIndex: maxZIndex + 1,
      };
      notes.push(newNote);
      saveNotes(); // Persist changes
      console.log('API: Created note successfully.', newNote);
      resolve(newNote);
    }, API_LATENCY);
  });
};

export const updateNote = async (
  noteId: string,
  updateData: Partial<Omit<Note, 'id'>>
): Promise<Note> => {
  console.log(`API: Updating note ${noteId}...`, updateData);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const noteIndex = notes.findIndex((n) => n.id === noteId);
      if (noteIndex === -1) {
        console.error(`API: Note with id ${noteId} not found.`);
        return reject(new Error('Note not found'));
      }
      notes[noteIndex] = { ...notes[noteIndex], ...updateData };
      saveNotes(); // Persist changes
      console.log('API: Updated note successfully.', notes[noteIndex]);
      resolve(notes[noteIndex]);
    }, API_LATENCY);
  });
};

export const deleteNote = async (noteId: string): Promise<{ id: string }> => {
  console.log(`API: Deleting note ${noteId}...`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const noteIndex = notes.findIndex((n) => n.id === noteId);
      if (noteIndex === -1) {
        console.error(`API: Note with id ${noteId} not found.`);
        return reject(new Error('Note not found'));
      }
      notes.splice(noteIndex, 1);
      saveNotes(); // Persist changes
      console.log(`API: Deleted note ${noteId} successfully.`);
      resolve({ id: noteId });
    }, API_LATENCY);
  });
};
