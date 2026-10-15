import { useEffect, useState, type ReactNode } from 'react'
import ChevronIcon from '@/shared/assets/icons/chevron.svg?react'
import styles from './SkillDetails.module.css'

const PLACEHOLDER_IMAGE = '/images/skills/placeholder.jpg'
// Ограничение видимых миниатюр — остальные показываем бейджем «+N»
const MAX_VISIBLE_THUMBNAILS = 4

export type SkillDetailsProps = {
  /** Название навыка */
  title: string
  /** Название категории */
  categoryName: string
  /** Название подкатегории */
  subcategoryName: string
  /** Описание навыка */
  description: string
  /** Список адресов изображений */
  images: string[]
  /** Содержимое блока кнопок — задаётся в месте подключения виджета */
  actions?: ReactNode
  /** Показывать стрелки переключения изображений */
  showGalleryControls?: boolean
  /** Дополнительный класс */
  className?: string
}

export function SkillDetails({
  title,
  categoryName,
  subcategoryName,
  description,
  images,
  actions,
  showGalleryControls = false,
  className = '',
}: SkillDetailsProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Родитель может подменить набор изображений (например, при переключении навыка) —
  // тогда возвращаемся к первому изображению, чтобы индекс не вышел за границы.
  useEffect(() => {
    setActiveIndex(0)
  }, [images])

  const hasImages = images.length > 0
  const safeIndex = hasImages ? Math.min(activeIndex, images.length - 1) : 0
  const currentImage = hasImages ? images[safeIndex] : PLACEHOLDER_IMAGE

  // Стрелки нужны только когда их явно включили и есть что переключать.
  const showArrows = showGalleryControls && images.length > 1

  // Первые MAX_VISIBLE_THUMBNAILS миниатюр показываем, остальные — бейджем «+N»
  const visibleImages = images.slice(0, MAX_VISIBLE_THUMBNAILS)
  const hiddenCount = images.length - visibleImages.length

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length)
  }

  return (
    <article className={[styles.container, className].filter(Boolean).join(' ')}>
      <div className={styles.content}>
        <div className={styles.info}>
          <div className={styles.textBlock}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.category}>
              {categoryName} / {subcategoryName}
            </p>
          </div>
          <p className={styles.description}>{description}</p>
        </div>

        {actions && <div className={styles.actions}>{actions}</div>}
      </div>

      <div className={styles.gallery}>
        <div className={styles.mainImage}>
          <img src={currentImage} alt={title} className={styles.image} />

          {showArrows && (
            <>
              <button
                type="button"
                className={`${styles.arrow} ${styles.arrowPrev}`}
                onClick={handlePrev}
                aria-label="Предыдущее изображение"
              >
                <ChevronIcon className={styles.arrowIcon} />
              </button>
              <button
                type="button"
                className={`${styles.arrow} ${styles.arrowNext}`}
                onClick={handleNext}
                aria-label="Следующее изображение"
              >
                <ChevronIcon className={styles.arrowIcon} />
              </button>
            </>
          )}
        </div>

        {hasImages && (
          <ul className={styles.thumbnails}>
            {visibleImages.map((image, index) => (
              <li key={`${image}-${index}`} className={styles.thumbnailItem}>
                <button
                  type="button"
                  className={`${styles.thumbnail} ${
                    index === safeIndex ? styles.thumbnailActive : ''
                  }`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Показать изображение ${index + 1}`}
                  aria-pressed={index === safeIndex}
                >
                  <img src={image} alt="" className={styles.thumbnailImage} />
                </button>
              </li>
            ))}

            {hiddenCount > 0 && (
              <li className={styles.thumbnailItem}>
                <span className={styles.thumbnailMore} aria-hidden="true">
                  +{hiddenCount}
                </span>
              </li>
            )}
          </ul>
        )}
      </div>
    </article>
  )
}
