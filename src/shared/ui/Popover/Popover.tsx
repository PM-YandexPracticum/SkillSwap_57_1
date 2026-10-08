import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import styles from './Popover.module.css';

export type PopoverProps = {
  trigger: ReactNode;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  align?: 'left' | 'right';
  className?: string;
};

export function Popover({
  trigger,
  children,
  open,
  onClose,
  align = 'left',
  className,
}: PopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) {
    return <div ref={containerRef} className={styles.root}>{trigger}</div>;
  }

  return (
    <div ref={containerRef} className={styles.root}>
      {trigger}
      <div
        className={`${styles.panel} ${align === 'right' ? styles.panelRight : styles.panelLeft} ${className ?? ''}`}
      >
        {children}
      </div>
    </div>
  );
}
