import { ChangeEvent, useId } from 'react'
import styles from './Textarea.module.css'

type TextareaProps = {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  rows?: number
  name?: string
  className?: string
}

export function Textarea({
  value,
  onChange,
  label,
  placeholder,
  error,
  rows = 3,
  name,
  className,
}: TextareaProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        className={`${styles.textarea} ${error ? styles.error : ''} ${className ? className : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span id={errorId} className={styles.errorText} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
