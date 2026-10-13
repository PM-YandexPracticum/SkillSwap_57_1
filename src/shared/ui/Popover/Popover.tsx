import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import styles from './Popover.module.css'

export type PopoverProps = {
  trigger: ReactNode
  children: ReactNode
  open: boolean
  onClose: () => void
  align?: 'left' | 'right'
  className?: string
  rootClassName?: string
  fullWidth?: boolean
  attached?: boolean
}

export function Popover({
  trigger,
  children,
  open,
  onClose,
  align = 'left',
  className,
  rootClassName,
  fullWidth = false,
  attached = false,
}: PopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  const rootClass = `${styles.root} ${rootClassName ?? ''} ${fullWidth ? styles.fullWidth : ''}`.trim()

  const panelClass = `${styles.panel} ${align === 'right' ? styles.panelRight : styles.panelLeft} ${attached ? styles.attached : ''} ${className ?? ''}`.trim()

  if (!open) {
    return (
      <div ref={containerRef} className={rootClass}>
        {trigger}
      </div>
    )
  }

  return (
    <div ref={containerRef} className={rootClass}>
      {trigger}
      <div className={panelClass}>
        {children}
      </div>
    </div>
  )
}
