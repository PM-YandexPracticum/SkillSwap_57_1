import * as React from 'react'
import { FC } from 'react'
import styles from './IconButton.module.css'

type TIconButtonProps = {
  icon: React.ReactElement | null
  label: string
  active?: boolean
  badge?: boolean
  onClick?: (e: React.MouseEvent) => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export const IconButton: FC<TIconButtonProps> = ({
  icon,
  label,
  active = false,
  badge = false,
  onClick = () => {},
  className = '',
  type = 'button',
}) => (
  <button
    className={`${styles.iconButton} ${active ? styles.active : ''} ${className}`}
    type={type}
    onClick={onClick}
    aria-label={label}
  >
    {icon}
    {badge && <div className={styles.badge}></div>}
  </button>
)
