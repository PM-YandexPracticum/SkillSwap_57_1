import Heart from '@/shared/assets/icons/heart.svg?react'
import HeartFilled from '@/shared/assets/icons/heart-filled.svg?react'
import styles from './FavoriteButton.module.css'
import { IconButton } from '@/shared/ui/IconButton'

type FavoriteButtonProps = {
  active: boolean;
  likesCount: number;
  onToggle: () => void;
  className?: string;
}

export const FavoriteButton = ({
  active,
  likesCount,
  onToggle,
  className
}: FavoriteButtonProps) => {


  return (
    <div className={`${styles.favorite} ${[className].filter(Boolean).join(' ')}`}>
      <IconButton
        icon={active ? <HeartFilled /> : <Heart />}
        label={active ? 'Убрать из избранного' : 'Добавить в избранное'}
        active={active}
        onClick={() => onToggle()}
      />
      <span className={styles.likes}>{likesCount}</span>
    </div>
  )

}
