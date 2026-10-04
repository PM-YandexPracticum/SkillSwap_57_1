import styles from './Divider.module.css'
import React from 'react'

/*
Применение в коде:
      <Divider/>
      <Divider>ИЛИ</Divider>
*/


type DividerProps = {
  children?: React.ReactNode
  className?: string
}

export const Divider = ({ children, className }: DividerProps) => {
  const classes = [styles.divider, className].filter(Boolean).join(' ')

  if (!children) {
    return <div className={classes} role="separator" />
  }

  return (
    <div className={`${classes} ${styles.dividerWithText}`} role="separator">
      <span className={styles.line} />
      <span className={styles.text}>{children}</span>
      <span className={styles.line} />
    </div>
  )
}
