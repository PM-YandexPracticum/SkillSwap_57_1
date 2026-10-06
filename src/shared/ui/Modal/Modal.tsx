
import * as React from 'react'
import styles from './Modal.module.css'

type ModalProps = {
  title: string
  text?: string
  icon?: React.ReactElement
  children: React.ReactElement
  onClose: () => void
  className?: string
}

export const Modal = ({ title, onClose, children, text, icon, className }: ModalProps) => {
  const modalClasses = [styles.modal, className].filter(Boolean).join(' ')

  return (
    <>
      <div className={modalClasses}>
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
