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
  id?: string
  className?: string
  maxLength?: number
  /** Режим чтения: поле отображается, но недоступно для ввода */
  readOnly?: boolean
  /** Иконка или кнопка справа сверху. */
  rightElement?: ReactNode
  /** Делает элемент справа интерактивным (кнопка-карандаш). */
  rightElementInteractive?: boolean
}

export function Textarea({
  value,
  onChange,
  label,
  placeholder,
  error,
  rows = 3,
  name,
  id,
  className,
  maxLength,
  readOnly = false,
  rightElement,
  rightElementInteractive = false,
}: TextareaProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const errorId = `${textareaId}-error`

  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label} htmlFor={textareaId}>
          {label}
        </label>
      )}
      <div
        className={`${styles.field} ${rightElement ? styles.fieldWithRight : ''}`.trim()}
      >
        <textarea
          id={textareaId}
          name={name}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          className={`${styles.textarea} ${error ? styles.error : ''} ${className ? className : ''}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          maxLength={maxLength}
          readOnly={readOnly}
        />
        {rightElement && (
          <span
            className={`${styles.rightElement} ${
              rightElementInteractive ? styles.rightElementInteractive : ''
            }`.trim()}
            aria-hidden={rightElementInteractive ? undefined : true}
          >
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
