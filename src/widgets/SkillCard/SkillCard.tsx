import { formatAge } from '@/shared/lib/age'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { FavoriteButton } from '@/shared/ui/FavoriteButton'
import { TagList } from '@/shared/ui/TagList'
import type { TagListProps } from '@/shared/ui/TagList'
import styles from './SkillCard.module.css'

type SkillCardTag = TagListProps['tags'][number]

type SkillCardBaseProps = {
  avatarUrl: string | null
  name: string
  city: string
  age: number
  teachTags: SkillCardTag[]
  learnTags: SkillCardTag[]
  /** Текст «О себе» — показывается под шапкой карточки (страница навыка) */
  about?: string
  collapsed?: boolean
  className?: string
}

type FavoriteProps =
  | {
      showFavorite?: true
      likesCount: number
      isFavorite: boolean
      onToggleFavorite: () => void
    }
  | {
      showFavorite: false
      likesCount?: number
      isFavorite?: boolean
      onToggleFavorite?: () => void
    }

type DetailsProps =
  | { showDetailsButton?: true; onDetails: () => void }
  | { showDetailsButton: false; onDetails?: () => void }

export type SkillCardProps = SkillCardBaseProps & FavoriteProps & DetailsProps

export const SkillCard = (props: SkillCardProps) => {
  const {
    avatarUrl,
    name,
    city,
    age,
    teachTags,
    learnTags,
    about,
    collapsed = true,
    className,
  } = props

  const favorite =
    props.showFavorite !== false
      ? {
          likesCount: props.likesCount,
          isFavorite: props.isFavorite,
          onToggle: props.onToggleFavorite,
        }
      : null
  const onDetails = props.showDetailsButton !== false ? props.onDetails : null

  return (
    <article className={[styles.card, className].filter(Boolean).join(' ')}>
      <header className={styles.header}>
        <Avatar src={avatarUrl} alt={name} size="m" className={styles.avatar} />

        <div className={styles.info}>
          <div className={styles.top}>
            <h3 className={styles.name}>{name}</h3>

            {favorite && (
              <FavoriteButton
                active={favorite.isFavorite}
                likesCount={favorite.likesCount}
                onToggle={favorite.onToggle}
              />
            )}
          </div>

          <p className={styles.meta}>
            {city}, {formatAge(age)}
          </p>
        </div>
      </header>

      {about && <p className={styles.about}>{about}</p>}

      <TagList title="Может научить:" tags={teachTags} collapsed={collapsed} />
      <TagList title="Хочет научиться:" tags={learnTags} collapsed={collapsed} />

      {onDetails && (
        <Button fullWidth onClick={() => onDetails()}>
          Подробнее
        </Button>
      )}
    </article>
  )
}
