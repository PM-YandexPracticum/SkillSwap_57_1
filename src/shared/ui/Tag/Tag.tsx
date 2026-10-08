import type { TCategoryId } from '@/shared/types'
import styles from './Tag.module.css'

type TagProps = {
  label: string
  categoryId?: TCategoryId
  className?: string
}

export function Tag({ label, categoryId, className }: TagProps) {
  return (
    <span
      className={`${styles.tag} ${categoryId ? styles[categoryId] : styles.more} ${className ? className : ''}`}
    >
      {label}
    </span>
  )
}
