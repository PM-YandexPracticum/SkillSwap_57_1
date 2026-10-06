import { FC } from 'react'
import LightbulbIcon from '@/shared/assets/icons/lightbulb.svg?react'
import CloseIcon from '@/shared/assets/icons/close.svg?react'
import styles from '@/shared/ui/Toast/Toast.module.css'
import { IconButton } from '@/shared/ui/IconButton'
import { Button } from '@/shared/ui/Button'

type TToastProps = {
  message: string
  onClose: () => void
  className?: string
}

export const Toast: FC<TToastProps> = ({ message, onClose, className = '' }) => (
  <div className={`${styles.container} ${className}`}>
    <span className={styles.iconContainer}>
      <LightbulbIcon />
    </span>
    <h3>{message}</h3>
    <span className={styles.closeButtonContainer}>
      <IconButton icon={<CloseIcon />} label={'Закрыть уведомление'} onClick={onClose} />
    </span>
    <Button variant={'tertiary'} className={styles.redirectButton}>
      Перейти
    </Button>
  </div>
)
