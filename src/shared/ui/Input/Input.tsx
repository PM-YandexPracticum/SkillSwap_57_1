import * as React from 'react'
import { FC, useId } from 'react'
import styles from './Input.module.css'

export type TInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'number'
  error?: string
  variant?: 'bordered' | 'borderless'
  disabled?: boolean
  className?: string
  name?: string
  id?: string
  autoComplete?: string
  maxLength?: number
  minLength?: number
  label?: string
}

export const Input: FC<TInputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  variant = 'bordered',
  disabled = false,
  className = '',
  name,
  id,
  autoComplete,
  maxLength,
  minLength,
  label,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        className={`${styles.input}
                    ${styles[`variant_${variant}`]}
                    ${error ? styles.error : ''}
                    ${className}`}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        name={name}
        id={inputId}
        autoComplete={autoComplete}
        maxLength={maxLength}
        minLength={minLength}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  )
}
