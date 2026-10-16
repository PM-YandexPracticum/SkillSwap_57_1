import type { User } from '@/shared/types'
import { Button } from '@/shared/ui/Button'
import { useInfiniteList } from '@/shared/hooks/useInfiniteList'
import { UserCardItem } from './UserCardItem'
import styles from '../CatalogPage.module.css'

type UserSectionProps = {
  title: string
  users: User[]
  onShowAll?: () => void
  showAllLabel?: string
  /** Включает порционную догрузку (для развёрнутого режима «Смотреть все») */
  paginate?: boolean
}

export function UserSection({
  title,
  users,
  onShowAll,
  showAllLabel = 'Смотреть все',
  paginate = false,
}: UserSectionProps) {
  // Хук вызываем всегда (правила хуков). Sentinel рендерим только в paginate-режиме —
  // тогда observer и не создаётся, если sentinel не в DOM (ref = null).
  const { visibleItems, hasMore, sentinelRef } = useInfiniteList(users)

  if (users.length === 0) return null

  const rendered = paginate ? visibleItems : users
  const showSentinel = paginate && hasMore

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
        {rendered.map((user) => (
          <UserCardItem key={user.id} user={user} />
        ))}
      </div>
      {showSentinel && <div ref={sentinelRef} aria-hidden="true" />}
    </section>
  )
}
