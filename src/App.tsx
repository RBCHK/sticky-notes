import { useRef, useState, useCallback, useEffect } from 'react';
import StickyNote from './components/StickyNote/StickyNote';
import { TrashZone } from './components/TrashZone/TrashZone';
import { useNotes } from './hooks/useNotes';
import { NOTE_COLORS } from './types/note';
import { MAX_WIDTH, MAX_HEIGHT, MIN_WIDTH, MIN_HEIGHT } from './hooks/useResize';

import './App.css';

function App() {
  const notesAreaRef = useRef<HTMLElement>(null);
  const trashZoneRef = useRef<HTMLDivElement>(null);

  const drawingStateRef = useRef<{
    startX: number;
    startY: number;
    areaRect: DOMRect;
  } | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingRect, setDrawingRect] = useState<React.CSSProperties | null>(null);

  const {
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
  } = useNotes({ notesAreaRef });

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    setDrawingRect(null);
    drawingStateRef.current = null;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (e.target !== notesAreaRef.current) return;

    const notesArea = notesAreaRef.current;
    if (!notesArea) return;

    setIsDrawing(true);

    const areaRect = notesArea.getBoundingClientRect();

    const startX = e.clientX - areaRect.left + notesArea.scrollLeft;
    const startY = e.clientY - areaRect.top + notesArea.scrollTop;

    drawingStateRef.current = { startX, startY, areaRect };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!isDrawing || !drawingStateRef.current || !notesAreaRef.current) return;
      e.preventDefault();

      const { startX, startY, areaRect } = drawingStateRef.current;
      const notesArea = notesAreaRef.current;

      const currentX = e.clientX - areaRect.left + notesArea.scrollLeft;
      const currentY = e.clientY - areaRect.top + notesArea.scrollTop;

      const x = Math.min(startX, currentX);
      const y = Math.min(startY, currentY);
      let width = Math.abs(currentX - startX);
      let height = Math.abs(currentY - startY);

      if (width > MAX_WIDTH) width = MAX_WIDTH;
      if (height > MAX_HEIGHT) height = MAX_HEIGHT;

      setDrawingRect({
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
      });
    },
    [isDrawing]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !drawingRect) {
      if (isDrawing) {
        stopDrawing();
      }
      return;
    }

    const width = Number(drawingRect.width);
    const height = Number(drawingRect.height);

    if (width > MIN_WIDTH || height > MIN_HEIGHT) {
      createNoteByDrawing({
        text: '',
        color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
        position: {
          x: Number(drawingRect.left),
          y: Number(drawingRect.top),
        },
        size: { width, height },
      });
    }

    stopDrawing();
  }, [isDrawing, drawingRect, createNoteByDrawing, stopDrawing]);

  useEffect(() => {
    if (!isDrawing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopDrawing();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawing, stopDrawing]);

  return (
    <div className={`app-container ${isDrawing ? 'no-select' : ''}`}>
      <header className="app-header">
        <h1 className="logo">Sticky Notes</h1>
        <button className="add-note-btn" onClick={handleAddNote} disabled={isLoading}>
          + New Sticky
        </button>
      </header>
      <main
        className={`notes-area ${isDrawing ? 'is-drawing' : ''}`}
        ref={notesAreaRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isDrawing && drawingRect && <div className="drawing-rectangle" style={drawingRect} />}
        {isLoading && <div className="loading-indicator">Loading notes...</div>}
        {error && <div className="error-message">{error}</div>}
        {!isLoading && !error && notes.length === 0 && (
          <div className="empty-state">
            <h2>Clean board, clean mind.</h2>
            <p>Click '+ New Sticky' button or just Drag anywhere to get things going.</p>
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
