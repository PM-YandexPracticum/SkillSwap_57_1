import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './TextLink.module.css'

type TextLinkProps = {
  children: ReactNode
  to: string
  variant?: 'accent' | 'default'
  className?: string
}

export function TextLink({ children, to, variant = 'accent', className }: TextLinkProps) {
  const classes = [styles.link, styles[variant], className].filter(Boolean).join(' ')

  return (
    <Link to={to} className={classes}>
      {children}
    </Link>
  )
}
