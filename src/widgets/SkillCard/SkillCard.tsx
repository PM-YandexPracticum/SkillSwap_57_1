import type { TCategoryId } from '@/shared/types'
import { formatAge } from '@/shared/lib/age'
import HeartIcon from '@/shared/assets/icons/heart.svg?react'
import HeartFilledIcon from '@/shared/assets/icons/heart-filled.svg?react'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { IconButton } from '@/shared/ui/IconButton'
import { TagList } from '@/shared/ui/TagList'
import styles from './SkillCard.module.css'

export type SkillCardTag = {
  id: string
  name: string
  categoryId: TCategoryId
}

export type SkillCardProps = {
  avatarUrl: string | null
  name: string
  city: string
  age: number
  teachTags: SkillCardTag[]
  learnTags: SkillCardTag[]
  likesCount?: number
  isFavorite?: boolean
  onToggleFavorite?: () => void
  onDetails?: () => void
  collapsed?: boolean
  showFavorite?: boolean
  showDetailsButton?: boolean
  className?: string
}

export const SkillCard = ({
  avatarUrl,
  name,
  city,
  age,
  teachTags,
  learnTags,
  likesCount = 0,
  isFavorite = false,
  onToggleFavorite,
  onDetails,
  collapsed = true,
  showFavorite = true,
  showDetailsButton = true,
  className,
}: SkillCardProps) => (
  <article className={[styles.card, className].filter(Boolean).join(' ')}>
    <header className={styles.header}>
      <Avatar src={avatarUrl} alt={name} size="m" />

      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.meta}>
          {city}, {formatAge(age)}
        </p>
      </div>

      {showFavorite && (
        <div className={styles.favorite}>
          <IconButton
            icon={isFavorite ? <HeartFilledIcon /> : <HeartIcon />}
            label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            active={isFavorite}
            onClick={() => onToggleFavorite?.()}
          />
          <span className={styles.likes}>{likesCount}</span>
        </div>
      )}
    </header>

    <TagList title="Может научить:" tags={teachTags} collapsed={collapsed} />
    <TagList title="Хочет научиться:" tags={learnTags} collapsed={collapsed} />

    {showDetailsButton && (
      <Button fullWidth onClick={() => onDetails?.()}>
        Подробнее
      </Button>
    )}
  </article>
)
