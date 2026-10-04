import * as React from 'react'
import { FC } from 'react'
import styles from './Button.module.css'

type TButtonProps = {
  children: React.ReactNode
  onClick: (e: React.MouseEvent) => void
  variant?: 'primary' | 'secondary' | 'tertiary' | 'link'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  fullWidth?: boolean
  className?: string
  iconLeft?: React.ReactElement | null
  iconRight?: React.ReactElement | null
}

export const Button: FC<TButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
  fullWidth = false,
  iconLeft = null,
  iconRight = null,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onClick(e)
  }
  return (
    <button
      disabled={disabled}
      className={`${styles.button}
              ${styles[`variant_${variant}`]}
              ${className}
              ${fullWidth ? styles.fullWidth : ''}`}
      onClick={handleClick}
      type={type}
    >
      {iconLeft && <span className={styles.iconContainer}>{iconLeft}</span>}
      {children}
      {iconRight && <span className={styles.iconContainer}>{iconRight}</span>}
    </button>
  )
}
