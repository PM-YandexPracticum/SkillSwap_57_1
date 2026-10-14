import type { User } from '@/shared/types'
import { Button } from '@/shared/ui/Button'
import { UserCardItem } from './UserCardItem'
import styles from '../CatalogPage.module.css'

type UserSectionProps = {
  title: string
  users: User[]
  onShowAll?: () => void
  showAllLabel?: string
}

export function UserSection({
  title,
  users,
  onShowAll,
  showAllLabel = 'Смотреть все',
}: UserSectionProps) {
  if (users.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>{title}</h2>
        {onShowAll && (
          <Button variant="secondary" onClick={onShowAll}>
            {showAllLabel}
          </Button>
        )}
      </div>
      <div className={styles.grid}>
        {users.map((user) => (
          <UserCardItem key={user.id} user={user} />
        ))}
      </div>
    </section>
  )
}
