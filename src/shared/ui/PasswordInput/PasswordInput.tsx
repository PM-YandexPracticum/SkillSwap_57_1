import { useState } from 'react'
import EyeIcon from '@/shared/assets/icons/eye.svg?react'
import EyeOffIcon from '@/shared/assets/icons/eye-off.svg?react'
import { IconButton } from '@/shared/ui/IconButton'
import { Input } from '@/shared/ui/Input'
import styles from './PasswordInput.module.css'

export type TPasswordInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  error?: string
  hint?: string
  name?: string
  id?: string
  className?: string
}

export const PasswordInput = ({
  value,
  onChange,
  placeholder,
  error,
  hint,
  name,
  id,
  className = '',
}: TPasswordInputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const toggleVisibility = () => {
    setIsPasswordVisible((isVisible) => !isVisible)
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <Input
        className={styles.input}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={isPasswordVisible ? 'text' : 'password'}
        error={error}
        name={name}
        id={id}
      />
      <IconButton
        className={styles.toggle}
        icon={isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
        label={isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'}
        onClick={toggleVisibility}
        type="button"
      />
      {!error && hint && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}
