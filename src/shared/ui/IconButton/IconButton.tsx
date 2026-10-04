import * as React from 'react'
import { FC } from 'react'
import styles from './IconButton.module.css'

type TIconButtonProps = {
  icon: React.ReactElement | null
  label?: string
  isActive?: boolean
  badge?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export const IconButton: FC<TIconButtonProps> = ({
  icon,
  label = '',
  isActive = false,
  badge = false,
  onClick = () => {},
}) => (
  <button
    className={`${styles.iconButton} ${isActive ? styles.active : ''}`}
    onClick={onClick}
    aria-label={label}
  >
    {icon}{badge && <div className={styles.badge}></div>}
  </button>
)
