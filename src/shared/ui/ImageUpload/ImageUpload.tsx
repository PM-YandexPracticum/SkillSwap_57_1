import styles from './ImageUpload.module.css'
import { Button } from '@/shared/ui/Button'
import ImageIcon from '@/shared/assets/icons/image-add.svg?react'
import { useRef, useState } from 'react'

type ImageUploadProps = {
  onChange: (files: File[]) => void
  text?: string
  multiple?: boolean
  className?: string
}

export const ImageUpload = ({ multiple = true, onChange, text, className }: ImageUploadProps) => {

  const [isDragging, setIsDragging] = useState(false)

  const containerClasses = [styles.container, className, isDragging && styles.dragging]
    .filter(Boolean)
    .join(' ')

  const dragCounter = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const appendFiles = (files: File[]) => {
    const images = files.filter((f) => f.type.split('/')[0] === 'image')
    if (images.length) {
      onChange(images)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    appendFiles(Array.from(e.target.files ?? []))
    e.target.value = ''
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounter.current++
    if (dragCounter.current === 1) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault()

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounter.current = 0
    const files = Array.from(e.dataTransfer.files)
    appendFiles(files)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={containerClasses}
    >
      {text && <span className={styles.text}>{text}</span>}
      <label className={styles.label}>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg, .jpeg, .png"
          name="file"
          multiple={multiple}
          className={'visually-hidden'}
          onChange={(e) => handleInputChange(e)}
        />
        <Button
          onClick={onButtonClick}
          iconLeft={<ImageIcon />}
          variant={'link'}
          className={styles.gap}
        >
          Выбрать изображения
        </Button>
      </label>
    </div>
  )
}
