import styles from './Tag.module.css'

export type TCategoryId = 'business' | 'creative' | 'languages' | 'education' | 'health' | 'home'
// TODO Перенести определение этого типа в src/shared/types и использовать вместо string в Skill.categoryId и Subcategory.categoryId

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
