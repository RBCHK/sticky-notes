export interface Note {
  id: string;
  text: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  zIndex: number;
}
