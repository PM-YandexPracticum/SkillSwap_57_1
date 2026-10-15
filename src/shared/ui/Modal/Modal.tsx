
import styles from './Modal.module.css'
import { ReactNode, useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

type ModalProps = {
  title: string
  text?: string
  icon?: ReactNode
  children: ReactNode
  onClose: () => void
  className?: string
}

export const Modal = ({ title, onClose, children, text, icon, className }: ModalProps) => {
  const modalClasses = [styles.modal, className].filter(Boolean).join(' ')
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  useEffect(() => {

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    const el = modalRef.current
    if (!el) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusable = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (node) => !node.hasAttribute('disabled') && node.offsetParent !== null,
      )

      if (focusable.length === 0) {
        e.preventDefault()
        el.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement as HTMLElement

      if (e.shiftKey) {
        if (active === first || active === el) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <div className={modalClasses} ref={modalRef} tabIndex={-1}>
        <div className={styles.icon}> {icon}</div>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <span className={styles.text}>{text}</span>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
      <div className={styles.overlay} onClick={onClose} />
    </>
  )
}
