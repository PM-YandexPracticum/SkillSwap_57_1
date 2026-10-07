import { ChangeEvent, FC, useRef } from 'react'
import styles from './AvatarUpload.module.css'
import { Avatar } from '@/shared/ui/Avatar'
import { IconButton } from '@/shared/ui/IconButton'
import EditImageIcon from '@/shared/assets/icons/image-edit.svg?react'
import PlusIcon from '@/shared/assets/icons/plus.svg?react'

type TAvatarUploadProps = {
  src?: string | null
  onChange: (file: File) => void
  size?: 's' | 'l'
  className?: string
}

export const AvatarUpload: FC<TAvatarUploadProps> = ({
  src = null,
  onChange,
  size = 's',
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonClick = () => {
    inputRef.current?.click()
  }
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onChange(file)
    }
    e.target.value = ''
  }
  return (
    <div
      className={`${className} ${styles.container} ${size === 's' ? styles.smallContainer : ''}`}
    >
      <Avatar src={src} alt={''} size={size} className={size === 's' ? styles.smallAvatar : ''} />
      <div
        className={`${styles.uploadIconContainer} ${size === 's' ? styles.smallUploadIconContainer : ''}`}
      >
        <IconButton
          icon={size === 's' ? <PlusIcon/> : <EditImageIcon />}
          label={'Загрузить новое фото'}
          className={`${styles.uploadIcon} ${size === 's' ? styles.smallUploadButton : ''}`}
          onClick={buttonClick}
        />
      </div>
      <label className={styles.label}>
        <input
          aria-hidden={true}
          tabIndex={-1}
          ref={inputRef}
          type="file"
          accept=".jpg, .jpeg, .png"
          name="file"
          multiple={false}
          className="visually-hidden"
          onChange={(e) => handleFileChange(e)}
        />
      </label>
    </div>
  )
}
