import { type ChangeEvent, type ReactNode, useId } from 'react'
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
  maxLength?: number
  /** Иконка или кнопка справа сверху. Декоративная — не перехватывает клики. */
  rightElement?: ReactNode
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
  maxLength,
  rightElement,
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
      <div
        className={`${styles.field} ${rightElement ? styles.fieldWithRight : ''}`.trim()}
      >
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
          maxLength={maxLength}
        />
        {rightElement && (
          <span className={styles.rightElement} aria-hidden="true">
            {rightElement}
          </span>
        )}
      </div>
      {error && (
        <span id={errorId} className={styles.errorText} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
