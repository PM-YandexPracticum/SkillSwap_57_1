import { NavLink } from 'react-router-dom'
import React, { FC } from 'react'
import styles from '@/shared/ui/MenuItem/MenuItem.module.css'

type TMenuItemProps = {
  icon: React.ReactNode
  label: string
  to: string
  className?: string
}

export const MenuItem: FC<TMenuItemProps> = ({ icon, label, to, className = '' }) => (
  <NavLink
    to={to}
    className={({ isActive }) => {
      return `${styles.navLink} ${className} ${isActive ? styles.active : ''}`
    }}
  >
    <span className={styles.iconContainer}>{icon}</span>
    {label}
  </NavLink>
)
