import { ChangeEvent, FC, useRef } from 'react'
import styles from './AvatarUpload.module.css'
import { Avatar } from '@/shared/ui/Avatar'
import EditImageIcon from '@/shared/assets/icons/image-edit.svg?react'
import { IconButton } from '@/shared/ui/IconButton'

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

  if (size === 'l')
    return (
      <div className={`${className} ${styles.container}`}>
        <Avatar src={src} alt={''} size={size} />
        <div className={styles.uploadIconContainer}>
          <IconButton
            icon={<EditImageIcon />}
            label={'Загрузить новое фото'}
            className={styles.uploadIcon}
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

  return (
    <>
      <button
        type={'button'}
        className={styles.smallUploadContainer}
        onClick={buttonClick}
        aria-label={'Загрузить новое фото'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 72 72"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M53.947 56.175A22.47 22.47 0 0 0 36 47.25a22.47 22.47 0 0 0-17.946 8.925m35.891 0a27 27 0 1 0-35.891 0m35.891 0A26.92 26.92 0 0 1 36.002 63a26.9 26.9 0 0 1-17.946-6.825M45 29.25a9 9 0 1 1-18 0 9 9 0 0 1 18 0"
          />
          <rect
            className={styles.svgAddCircle}
            width="16"
            height="16"
            x="48"
            y="48"
            stroke="currentColor"
            strokeWidth="1.5"
            rx="8"
          />
          <path
            className={styles.svgPlus}
            stroke="currentcolor"
            strokeLinecap="round"
            strokeWidth="1.5"
            d="M56 52.5v8m-4-4h8"
          />
        </svg>
      </button>
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
    </>
  )
}
