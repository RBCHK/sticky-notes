export const NOTE_COLORS = ['#ffffcc', '#ccffcc', '#ccccff', '#ffcccc'] as const;

export type NoteColor = (typeof NOTE_COLORS)[number];

export interface Note {
  id: string;
  text: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: NoteColor;
  zIndex: number;
  isOverTrash?: boolean;
}
