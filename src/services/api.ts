import type { Note } from '../types/note';

const LOCAL_STORAGE_KEY = 'sticky-notes-data';
const API_LATENCY = 500;

const initialNotes: Note[] = [
  {
    id: 'note_1',
    text: '👋 Click "+ New Sticky" to create me here! 👋 ',
    color: '#ccffcc',
    position: { x: 820, y: 25 },
    size: { width: 373, height: 110 },
    zIndex: 10,
  },
  {
    id: 'note_2',
    text: '📏 Try resizing me by dragging the bottom right corner! ↘',
    color: '#ffcccc',
    position: { x: 1100, y: 190 },
    size: { width: 135, height: 108 },
    zIndex: 3,
  },
  {
    id: 'note_3',
    text: '🚚 Drag me anywhere on the board - too many sticky neighbors around.',
    color: '#ccccff',
    position: { x: 945, y: 215 },
    size: { width: 270, height: 220 },
    zIndex: 8,
  },
  {
    id: 'note_4',
    text: 'Drag me into the "trash" zone 🗑️ to remove me. I gotta dash! ↓ ↓ ↓',
    color: '#ffcccc',
    position: { x: 590, y: 145 },
    size: { width: 310, height: 235 },
    zIndex: 9,
  },
  {
    id: 'note_5',
    text: '🧨 Clear the board when you’re done playing.',
    color: '#ffcccc',
    position: { x: 910, y: 490 },
    size: { width: 310, height: 235 },
    zIndex: 2,
  },
  {
    id: 'note_6',
    text: 'Excuse me, I am not wallpaper! Click me to bring me to the top 🔝, please.',
    color: '#ffffcc',
    position: { x: 700, y: 300 },
    size: { width: 450, height: 450 },
    zIndex: 2,
  },
  {
    id: 'note_7',
    text: '😢 Remember that guy you just removed? Yeah... he is not coming back. Do not believe me? Refresh the page.',
    color: '#ccccff',
    position: { x: 610, y: 160 },
    size: { width: 250, height: 200 },
    zIndex: 1,
  },
  {
    id: 'note_8',
    text: 'See that white dot ↗ ↗ ↗ in the top right corner? Do not click it. 😄 ',
    color: '#ccffcc',
    position: { x: 1070, y: 365 },
    size: { width: 215, height: 311 },
    zIndex: 5,
  },
  {
    id: 'note_9',
    text: '☁️☁️☁️ We are all syncing to the cloud via REST API... Kind of 😅',
    color: '#ccccff',
    position: { x: 635, y: 475 },
    size: { width: 215, height: 310 },
    zIndex: 10,
  },
  {
    id: 'note_10',
    text: '',
    color: '#ffffcc',
    position: { x: 765, y: 380 },
    size: { width: 250, height: 200 },
    zIndex: 8,
  },
];

// LocalStorage Logic
let notes: Note[] = [];

const loadNotes = () => {
  try {
    const storedNotes = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedNotes) {
      notes = JSON.parse(storedNotes);
      console.log('API: Loaded notes from LocalStorage.');
    } else {
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

loadNotes();

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
      saveNotes();
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
      saveNotes();
      console.log(`API: Deleted note ${noteId} successfully.`);
      resolve({ id: noteId });
    }, API_LATENCY);
  });
};
