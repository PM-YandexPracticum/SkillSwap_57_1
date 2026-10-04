import { FC } from 'react'
import UserAvatar from '@/shared/assets/icons/user.svg?react'
import styles from './Avatar.module.css'

type TAvatarProps = {
  src: string | null
  alt: string
  size: 's' | 'm' | 'l'
  className?: string
}

export const Avatar: FC<TAvatarProps> = ({ src, alt, size, className = '' }) => (
  <div className={`${styles.container} ${styles[`size_${size}`]} ${className}`}>
    {src ? <img src={src} alt={alt} className={styles.image} /> : <UserAvatar className={styles.emptyAvatar}/>}
  </div>
)
