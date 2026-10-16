import { useEffect, useState, type ReactNode } from 'react'
import ChevronIcon from '@/shared/assets/icons/chevron.svg?react'
import styles from './SkillDetails.module.css'

const PLACEHOLDER_IMAGE = '/images/skills/placeholder.jpg'

// Три слота справа: две миниатюры и последняя картинка с бейджем.
const MAX_VISIBLE_THUMBNAILS = 3

export type SkillDetailsProps = {
  title: string
  categoryName: string
  subcategoryName: string
  description: string
  images: string[]
  actions?: ReactNode
  showGalleryControls?: boolean
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

  useEffect(() => {
    setActiveIndex(0)
  }, [images])

  const hasImages = images.length > 0
  const safeIndex = hasImages ? Math.min(activeIndex, images.length - 1) : 0
  const currentImage = hasImages ? images[safeIndex] : PLACEHOLDER_IMAGE

  const showArrows = showGalleryControls && images.length > 1

  // Первое изображение изначально показано крупно.
  // Следующие два отображаются обычными миниатюрами.
  const visibleImages = images.slice(1, MAX_VISIBLE_THUMBNAILS)

  // Исключаем большую картинку и обычные миниатюры.
  const hiddenCount = Math.max(0, images.length - 1 - visibleImages.length)
  const lastImageIndex = images.length - 1

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

        {images.length > 1 && (
          <ul className={styles.thumbnails}>
            {visibleImages.map((image, index) => {
              const imageIndex = index + 1
              const isActive = imageIndex === safeIndex

              return (
                <li key={`${image}-${imageIndex}`} className={styles.thumbnailItem}>
                  <button
                    type="button"
                    className={`${styles.thumbnail} ${isActive ? styles.thumbnailActive : ''}`}
                    onClick={() => setActiveIndex(imageIndex)}
                    aria-label={`Показать изображение ${imageIndex + 1}`}
                    aria-pressed={isActive}
                  >
                    <img src={image} alt="" className={styles.thumbnailImage} />
                  </button>
                </li>
              )
            })}

            {hiddenCount > 0 && (
              <li className={styles.thumbnailItem}>
                <button
                  type="button"
                  className={`${styles.thumbnail} ${
                    lastImageIndex === safeIndex ? styles.thumbnailActive : ''
                  }`}
                  onClick={() => setActiveIndex(lastImageIndex)}
                  aria-label={`Показать последнее изображение. Ещё изображений: ${hiddenCount}`}
                  aria-pressed={lastImageIndex === safeIndex}
                >
                  <img src={images[lastImageIndex]} alt="" className={styles.thumbnailImage} />

                  <span className={styles.thumbnailMore} aria-hidden="true">
                    +{hiddenCount}
                  </span>
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </article>
  )
}
