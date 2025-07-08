import { forwardRef } from 'react';

import styles from './TrashZone.module.css';

interface TrashZoneProps {
  isDragging: boolean;
  isOverTrash: boolean;
}

export const TrashZone = forwardRef<HTMLDivElement, TrashZoneProps>(function TrashZone(
  { isDragging, isOverTrash },
  ref
) {
  return (
    <div
      ref={ref}
      className={`${styles.trashZone} ${isDragging ? styles.visible : ''} ${
        isOverTrash ? styles.active : ''
      }`}
    >
      <p className={styles.trashText}>Drag here to remove sticky</p>
    </div>
  );
});
